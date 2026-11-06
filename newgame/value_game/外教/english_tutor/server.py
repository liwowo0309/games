# 本地外教服务。钥匙从 llm_providers/kimi.yaml 或环境变量读取，不进网页。
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(ROOT, "public")


def load_env(path):
    if not os.path.exists(path):
        return
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            text = line.strip()
            if not text or text.startswith("#") or "=" not in text:
                continue
            key, value = text.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


load_env(os.path.join(ROOT, ".env"))


def parse_simple_yaml(path):
    data = {}
    with open(path, "r", encoding="utf-8") as handle:
        for line in handle:
            if not line.strip() or line.lstrip().startswith("#") or line[:1] in (" ", "\t"):
                continue
            if ":" not in line:
                continue
            key, value = line.split(":", 1)
            value = value.split("#", 1)[0].strip().strip('"').strip("'")
            if value:
                data[key.strip()] = value
    return data


def find_provider_dirs():
    found = []
    directory = ROOT
    for _ in range(6):
        for parts in (("llm_providers",), ("llm_providers", "llm_providers")):
            path = os.path.join(directory, *parts)
            if os.path.isdir(path) and path not in found:
                found.append(path)
        parent = os.path.dirname(directory)
        if parent == directory:
            break
        directory = parent
    downloads = os.path.join(os.path.expanduser("~"), "Downloads", "llm_providers", "llm_providers")
    if os.path.isdir(downloads) and downloads not in found:
        found.append(downloads)
    return found


def load_provider(directory, filename):
    path = os.path.join(directory, filename)
    if not os.path.isfile(path):
        return None
    data = parse_simple_yaml(path)
    key = data.get("api_key") or ""
    if not key or key.startswith("${"):
        return None
    base_url = (data.get("base_url") or "").rstrip("/")
    model = data.get("model") or ""
    if not base_url or not model:
        return None
    try:
        temperature = float(data.get("temperature") or 0.7)
    except ValueError:
        temperature = 0.7
    return {
        "name": filename[:-5],
        "path": path,
        "key": key,
        "model": model,
        "base_url": base_url,
        "temperature": temperature,
    }


def load_providers():
    providers = []
    seen = set()
    for directory in find_provider_dirs():
        for filename in ("kimi.yaml", "deepseek.yaml"):
            item = load_provider(directory, filename)
            if not item or item["name"] in seen:
                continue
            seen.add(item["name"])
            providers.append(item)
    return providers


PROVIDERS = load_providers()
ACTIVE = {"index": 0}

PORT = int(os.environ.get("PORT") or 8787)

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json",
}

LESSON_END = re.compile(
    r"class is over|that'?s all for today|lesson is over|time is up|see you next|"
    r"goodbye for today|we are done|下课|今天就到|课时结束|今日完成|任务完成",
    re.I,
)
BYE_ONLY = re.compile(r"^(bye|goodbye|see you)[.!?]?$", re.I)

GREET = {
    "low": ["What color do you like?", "你喜欢什么颜色？"],
    "mid": ["How was school today?", "今天学校怎么样？"],
    "high": ["What did you do after school today?", "今天放学后你做了什么？"],
}

NEXT = {
    "low": [
        ["What animal do you like?", "你喜欢什么动物？"],
        ["What food do you like?", "你喜欢吃什么？"],
        ["Do you like cats?", "你喜欢猫吗？"],
        ["Who is in your family?", "家里有谁？"],
        ["What color do you like?", "你喜欢什么颜色？"],
    ],
    "mid": [
        ["What did you eat today?", "你今天吃了什么？"],
        ["Do you have a pet?", "你有宠物吗？"],
        ["What do you do on weekends?", "周末你做什么？"],
        ["How is school?", "学校怎么样？"],
    ],
    "high": [
        ["Why do you like that?", "你为什么喜欢这个？"],
        ["What happened next?", "后来发生了什么？"],
        ["Who did you go with?", "和谁一起？"],
        ["What did you do after school today?", "今天放学后你做了什么？"],
    ],
}

NOTICED = [
    (re.compile(r"蓝色|blue", re.I), "blue", "蓝色"),
    (re.compile(r"红色|red", re.I), "red", "红色"),
    (re.compile(r"绿色|green", re.I), "green", "绿色"),
    (re.compile(r"黄色|yellow", re.I), "yellow", "黄色"),
    (re.compile(r"猫|cats?", re.I), "cats", "猫"),
    (re.compile(r"狗|dogs?", re.I), "dogs", "狗"),
    (re.compile(r"公园|park", re.I), "the park", "公园"),
    (re.compile(r"面条|noodles?", re.I), "noodles", "面条"),
    (re.compile(r"米饭|rice", re.I), "rice", "米饭"),
    (re.compile(r"苹果|apple", re.I), "apples", "苹果"),
    (re.compile(r"妈妈|mom", re.I), "Mom", "妈妈"),
    (re.compile(r"爸爸|dad", re.I), "Dad", "爸爸"),
    (re.compile(r"篮球|basketball", re.I), "basketball", "篮球"),
    (re.compile(r"足球|football|soccer", re.I), "football", "足球"),
    (re.compile(r"学校|school", re.I), "school", "学校"),
    (re.compile(r"周末|weekend", re.I), "the weekend", "周末"),
]

UNSAFE = re.compile(r"自杀|去死|杀死|色情|裸体|强奸|炸弹|枪支|家暴|住址|家庭地址|电话号码|我的学校叫|密码|毒品")
LONG_NUMBER = re.compile(r"\d{8,}")

RECASTS = [
    (re.compile(r"\bi go(?:ed)? (?:to )?(?:the )?park yesterday\b", re.I), "You went to the park yesterday."),
    (re.compile(r"\bi (?:go|went) to (?:the )?park yesterday\b", re.I), "You went to the park yesterday."),
    (re.compile(r"\bi go(?:ed)? to school yesterday\b", re.I), "You went to school yesterday."),
    (re.compile(r"\bi eated (.+)", re.I), r"You ate \1"),
    (re.compile(r"\b(he|she) don'?t (.+)", re.I), r"\1 doesn't \2"),
    (re.compile(r"\bi is (\d+)\b", re.I), r"You are \1"),
]


def current_provider():
    if not PROVIDERS:
        return None
    return PROVIDERS[min(ACTIVE["index"], len(PROVIDERS) - 1)]


def api_key():
    env_key = os.environ.get("MOONSHOT_API_KEY") or os.environ.get("KIMI_API_KEY") or ""
    if env_key:
        return env_key
    provider = current_provider()
    return provider["key"] if provider else ""


def band_of(grade):
    if grade <= 2:
        return "low"
    if grade <= 4:
        return "mid"
    return "high"


def system_prompt(grade, nickname):
    style = {
        "low": "小学一、二年级：词很少。可以先用一个很短的感叹接住（例如 Blue!），再问一件事。一共不要超过两句，不要从句，不要讲小段。一个单词也要接住。",
        "mid": "小学三、四年级：短对话。先用很短的英语接住孩子的意思，再主要问一件事。不要一个人讲一段。",
        "high": "小学五、六年级：最多两句。如果孩子的英语不标准，第一句把孩子的意思轻轻说成正确、自然的英语，第二句再问原因、对象或刚才发生的事。不要停在 What's this 或 What's your name。说错了对话继续，不说 wrong，不打分。",
    }[band_of(grade)]
    return (
        "你是一位随时都在的美式英语外教，正在和中国小学生聊天。"
        "孩子在这台设备上的昵称是「%s」，现在是 %s 年级。你可以偶尔叫这个昵称，按原样叫，不要改成拼音。昵称不是真实身份。\n\n%s\n\n"
        "怎么说：\n"
        "- 主句永远是英语。chinese 只是这句英语的一行很短的中文意思，不拿中文讲课，不解释语法。\n"
        "- 孩子说中文也算接上了。听懂意思，用简单英语接回去。不要说「请说英语」。\n"
        "- 说完就等孩子。不要说下课、今日完成、课时结束、Bye、Goodbye、See you next time。\n"
        "- 主动聊学校、动物、食物、家人、爱好。孩子提到课间、宠物、晚饭、周末，就接住。\n"
        "- 不追问真实姓名、学校名称、家庭住址、电话。不要把身份问全。\n"
        "- 如果孩子说到害怕、暴力、色情、隐私或不适合这个年龄的内容，用很短的英语把话带回学校、动物、食物、家人或爱好，然后停住，不要追问细节。\n"
        "- 年级只影响你怎么说。前面如果是别的年级聊的，从这一句起按 %s 年级说，不要重写旧对话。\n\n"
        "例子只说明口气，不要照抄：\n"
        "- 一年级，孩子说 blue。英语可以是：Blue! What food do you like? 中文：蓝色！你喜欢吃什么？\n"
        "- 六年级，孩子说 I go park yesterday。英语可以是：You went to the park yesterday. Who did you go with? 中文：你昨天去了公园。和谁一起？\n\n"
        "只输出一个 JSON 对象，不要 markdown：\n"
        '{"english":"外教说的英语","chinese":"一行很短的中文"}'
    ) % (nickname, grade, style, grade)


def build_messages(grade, nickname, history):
    messages = [{"role": "system", "content": system_prompt(grade, nickname)}]
    if not history:
        messages.append({
            "role": "user",
            "content": "孩子刚打开聊天，还没说话。请先用英语打招呼，并问一个跟年级相称的问题。只输出 JSON。",
        })
        return messages
    for turn in history:
        if turn["from"] == "child":
            messages.append({"role": "user", "content": turn["text"]})
        else:
            messages.append({"role": "assistant", "content": turn["english"]})
    messages.append({
        "role": "user",
        "content": "请接住孩子刚才的意思，按系统说明的年级说下一句。只输出 JSON。chinese 必须是你这句英语的中文意思。",
    })
    return messages


def sentence_parts(text):
    compact = re.sub(r"\s+", " ", text or "").strip()
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+", compact) if part.strip()]


def shape_reply(english, chinese, grade):
    parts = sentence_parts(english) or ["What do you like?"]
    if grade <= 2:
        words = [word for word in " ".join(parts).split() if word]
        parts = parts[-1:] if len(words) > 16 else parts[:2]
    else:
        parts = parts[:2]
    en = " ".join(parts).strip()
    zh = re.sub(r"\s+", "", chinese or "")
    if LESSON_END.search(en) or BYE_ONLY.match(en):
        if grade <= 2:
            en, zh = "What animal do you like?", "你喜欢什么动物？"
        elif grade <= 4:
            en, zh = "What do you like doing after school?", "放学后你喜欢做什么？"
        else:
            en, zh = "What did you do after that?", "后来你做了什么？"
    zh = re.split(r"[\n；]", zh)[0] if zh else ""
    if len(zh) > 30:
        zh = zh[:30]
    if not zh:
        zh = "听这一句就好。" if grade <= 2 else "这句话的意思在英语里。"
    return {"english": en, "chinese": zh}


def sanitize_history(items):
    if not isinstance(items, list):
        return []
    out = []
    for item in items[-12:]:
        if not isinstance(item, dict):
            continue
        if item.get("from") == "child":
            text = str(item.get("text") or "").strip()[:200]
            if text:
                out.append({"from": "child", "text": text})
        elif item.get("from") == "tutor":
            english = str(item.get("english") or "").strip()[:400]
            chinese = str(item.get("chinese") or "").strip()[:40]
            if english:
                out.append({"from": "tutor", "english": english, "chinese": chinese})
    return out


def message_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join((part.get("text") or part.get("content") or "") for part in content if isinstance(part, dict))
    return ""


def parse_tutor_json(raw):
    text = str(raw or "").strip()
    text = re.sub(r"^```(?:json)?", "", text, flags=re.I).strip()
    text = re.sub(r"```$", "", text).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        text = text[start:end + 1]
    data = json.loads(text)
    english = str(data.get("english") or "").strip()
    chinese = str(data.get("chinese") or "").strip()
    if not english:
        raise ValueError("no english")
    return english, chinese


class TutorError(Exception):
    def __init__(self, code, status):
        super().__init__(code)
        self.code = code
        self.status = status


def redact(text):
    return re.sub(r"sk-[A-Za-z0-9_\-]+", "sk-***", str(text))


def quota_failure(code, detail):
    text = (detail or "").lower()
    return code in (401, 402, 429) and any(
        word in text for word in ("balance", "quota", "suspended", "billing", "user not found")
    )


def request_body(provider, messages):
    body = {
        "model": provider["model"],
        "messages": messages,
        "temperature": provider["temperature"],
        "max_tokens": 600,
        "response_format": {"type": "json_object"},
    }
    if "k3" in provider["model"].lower():
        body["reasoning_effort"] = "low"
        body["max_completion_tokens"] = 2048
        body.pop("max_tokens", None)
    return body


def post_llm(provider, body):
    payload = json.dumps(body).encode("utf-8")
    request = urllib.request.Request(
        provider["base_url"] + "/chat/completions",
        data=payload,
        headers={
            "Authorization": "Bearer " + provider["key"],
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.loads(response.read().decode("utf-8")), None
    except urllib.error.HTTPError as error:
        detail = redact(error.read().decode("utf-8", "replace")[:500])
        print(provider["name"], error.code, detail, file=sys.stderr)
        sys.stderr.flush()
        return None, (error.code, detail)
    except Exception as error:
        print(provider["name"], "failed", redact(error), file=sys.stderr)
        sys.stderr.flush()
        return None, (0, redact(error))


def read_reply(data, grade):
    content = message_text((data.get("choices") or [{}])[0].get("message", {}).get("content"))
    english, chinese = parse_tutor_json(content)
    return shape_reply(english, chinese, grade)


def llm_reply(grade, nickname, history):
    messages = build_messages(grade, nickname, history)
    last_error = None
    while current_provider():
        provider = current_provider()
        body = request_body(provider, messages)
        data, last_error = post_llm(provider, body)
        if not data and last_error and last_error[0] == 400:
            plain = dict(body)
            plain.pop("response_format", None)
            data, last_error = post_llm(provider, plain)
        if data:
            try:
                return read_reply(data, grade)
            except Exception as error:
                print("parse", redact(error), file=sys.stderr)
                raise TutorError("unavailable", 502)
        code, detail = last_error or (0, "")
        if quota_failure(code, detail) and ACTIVE["index"] < len(PROVIDERS) - 1:
            ACTIVE["index"] += 1
            nxt = current_provider()
            print("改用 %s（%s）" % (nxt["name"], nxt["model"]), file=sys.stderr)
            sys.stderr.flush()
            continue
        if code == 401:
            raise TutorError("bad_key", 401)
        if code == 429:
            raise TutorError("busy", 429)
        raise TutorError("unavailable", 502)
    raise TutorError("unavailable", 502)


def notice(text):
    for pattern, en, zh in NOTICED:
        if pattern.search(text):
            return {"en": en, "zh": zh}
    word = re.search(r"[A-Za-z]{2,}", text)
    if word:
        return {"en": word.group(0).lower(), "zh": ""}
    return None


def cap(word):
    if not word:
        return ""
    return word[0].upper() + word[1:]


def gentle_recast(text):
    source = re.sub(r"\s+", " ", text.strip())
    for pattern, repl in RECASTS:
        if not pattern.search(source):
            continue
        out = re.sub(r"\s+", " ", pattern.sub(repl, source, count=1)).strip()
        out = cap(out)
        if not re.search(r"[.!?]$", out):
            out += "."
        return out
    return None


def next_question(band, history):
    asked = [item["english"] for item in history if item["from"] == "tutor"]
    for item in NEXT[band]:
        if not any(item[0] in line for line in asked):
            return item
    return NEXT[band][0]


def redirect(grade):
    if grade <= 2:
        return shape_reply("Let's talk about animals. Do you like cats?", "我们说说小动物。你喜欢猫吗？", grade)
    if grade <= 4:
        return shape_reply("Let's talk about food. What do you like to eat?", "我们聊聊吃的。你喜欢吃什么？", grade)
    return shape_reply(
        "Let's talk about something fun, like food or pets. What food do you like?",
        "我们聊点开心的，比如吃的。你喜欢什么？",
        grade,
    )


def local_tutor(grade, nickname, history):
    band = band_of(grade)
    last_child = next((item for item in reversed(history) if item["from"] == "child"), None)
    safe_name = "".join(ch for ch in nickname if ch.isalnum())[:8]
    if last_child is None:
        hello = ("Hi, %s! " % safe_name) if safe_name else "Hi! "
        question, zh = GREET[band]
        zh_hello = ("%s，%s" % (safe_name, zh)) if safe_name else zh
        return shape_reply(hello + question, zh_hello, grade)
    if UNSAFE.search(last_child["text"]) or LONG_NUMBER.search(last_child["text"]):
        return redirect(grade)
    heard = notice(last_child["text"])
    question, qzh = next_question(band, history)
    if grade >= 5:
        recast = gentle_recast(last_child["text"])
        park = bool(re.search(r"park", recast or "", re.I)) if recast else (heard or {}).get("en") == "the park"
        follow = ["Who did you go with?", "和谁一起？"] if park else [question, qzh]
        if recast:
            gloss = "你昨天去了公园。" if park else ""
            return shape_reply("%s %s" % (recast, follow[0]), gloss + follow[1], grade)
        if park:
            return shape_reply("You went to the park. %s" % follow[0], "你去了公园。" + follow[1], grade)
        if heard:
            zh = ("你说到%s。%s" % (heard["zh"], follow[1])) if heard["zh"] else follow[1]
            return shape_reply("You like %s. %s" % (heard["en"], follow[0]), zh, grade)
        return shape_reply("Tell me a little more. %s" % follow[0], follow[1], grade)
    if grade <= 2:
        if heard:
            zh = ("%s！%s" % (heard["zh"], qzh)) if heard["zh"] else qzh
            return shape_reply("%s! %s" % (cap(heard["en"]), question), zh, grade)
        return shape_reply(question, qzh, grade)
    if heard:
        zh = ("你说到%s。%s" % (heard["zh"], qzh)) if heard["zh"] else qzh
        return shape_reply("You like %s. %s" % (heard["en"], question), zh, grade)
    return shape_reply(question, qzh, grade)


def tutor_reply(grade, nickname, history):
    if not current_provider() and not api_key():
        return local_tutor(grade, nickname, history)
    if current_provider():
        return llm_reply(grade, nickname, history)
    return local_tutor(grade, nickname, history)


def public_file(url_path):
    path = urllib.parse.urlparse(url_path).path
    try:
        pathname = urllib.parse.unquote(path)
    except Exception:
        return None
    if pathname in ("", "/"):
        pathname = "/index.html"
    root = os.path.realpath(PUBLIC)
    target = os.path.realpath(os.path.join(root, pathname.lstrip("/").replace("/", os.sep)))
    try:
        if os.path.commonpath([root, target]) != root:
            return None
    except ValueError:
        return None
    return target


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))

    def send_json(self, status, body):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length < 0 or length > 32000:
            raise TutorError("bad_request", 413)
        raw = self.rfile.read(length) if length else b""
        if not raw:
            return {}
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            raise TutorError("bad_request", 400)

    def do_GET(self):
        self.route(False)

    def do_HEAD(self):
        self.route(True)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path != "/api/chat":
            self.send_json(405, {"error": "method"})
            return
        try:
            body = self.read_json()
        except TutorError as error:
            self.send_json(error.status, {"error": error.code})
            return
        try:
            grade = int(body.get("grade"))
        except (TypeError, ValueError):
            self.send_json(400, {"error": "bad_request"})
            return
        nickname = str(body.get("nickname") or "").strip()[:8]
        if grade < 1 or grade > 6 or not nickname:
            self.send_json(400, {"error": "bad_request"})
            return
        history = sanitize_history(body.get("messages"))
        try:
            reply = tutor_reply(grade, nickname, history)
        except TutorError as error:
            self.send_json(error.status, {"error": error.code})
            return
        self.send_json(200, reply)

    def route(self, head_only):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/health":
            provider = current_provider()
            self.send_json(200, {
                "ok": True,
                "engine": provider["name"] if provider else "local",
                "model": provider["model"] if provider else None,
            })
            return
        target = public_file(self.path)
        if not target or not os.path.isfile(target):
            self.send_json(404, {"error": "not_found"})
            return
        with open(target, "rb") as handle:
            data = handle.read()
        ext = os.path.splitext(target)[1].lower()
        self.send_response(200)
        self.send_header("Content-Type", MIME.get(ext, "application/octet-stream"))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if not head_only:
            self.wfile.write(data)


def settle_provider():
    provider = current_provider()
    if not provider or provider["name"] != "kimi" or len(PROVIDERS) < 2:
        return
    body = request_body(provider, [{"role": "user", "content": "Reply with JSON {\"english\":\"Hi\",\"chinese\":\"你好\"}"}])
    data, err = post_llm(provider, body)
    if data or not err or not quota_failure(err[0], err[1]):
        return
    ACTIVE["index"] += 1
    nxt = current_provider()
    print("Kimi 余额不足，改用 %s（%s）" % (nxt["name"], nxt["model"]))
    sys.stdout.flush()


def main():
    settle_provider()
    port = PORT
    server = None
    for candidate in range(PORT, PORT + 10):
        try:
            server = ThreadingHTTPServer(("127.0.0.1", candidate), Handler)
            port = candidate
            break
        except OSError:
            continue
    if server is None:
        print("8787 到 8796 这些端口都开不了。", file=sys.stderr)
        sys.exit(1)
    provider = current_provider()
    if provider:
        engine = "%s（%s）  钥匙来自 %s" % (provider["name"], provider["model"], provider["path"])
    else:
        engine = "本机试用（没找到 llm_providers）"
    print("英语外教  http://127.0.0.1:%s" % port)
    print("外教引擎  %s" % engine)
    sys.stdout.flush()
    server.serve_forever()


if __name__ == "__main__":
    main()
