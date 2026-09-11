(function () {
  function alt(line, hint, words, choices) {
    return {
      line,
      hint,
      accept: [{ any: words }],
      choices: choices.map((text) => ({ text, target: true }))
    };
  }

  function put(eventId, grade, stepIndex, list) {
    const event = window.LifeEvents[eventId];
    const step = event && event.packs[grade] && event.packs[grade][stepIndex];
    if (!step) return;
    step.alts = list;
  }

  put("enterSchool", 2, 0, [
    alt("Do you want to go to the school?", "说 Yes, I want 或 Yes", ["yes", "want", "school", "go", "ok", "okay"], ["Yes, I want.", "Yes.", "I want to go."]),
    alt("Are you ready for school?", "说 Yes 或 I'm ready", ["yes", "ready", "i'm", "i am", "ok"], ["Yes.", "I'm ready.", "Yes, I am ready."]),
    alt("Shall we go in now?", "说 Yes, let's go 或 OK", ["yes", "go", "let's", "in", "ok", "okay"], ["Yes, let's go.", "OK.", "Let's go in."]),
    alt("Did you bring your bag?", "说 Yes 或 I did", ["yes", "bag", "did", "bring", "i have"], ["Yes.", "Yes, I did.", "I have my bag."])
  ]);
  put("enterSchool", 2, 1, [
    alt("Welcome! Come in, please.", "说 Thank you 或 Hello", ["thank", "hello", "hi", "ok", "come"], ["Thank you.", "Hello.", "OK."]),
    alt("Good morning! Sit down, please.", "说 Good morning 或 Thank you", ["morning", "thank", "sit", "hello"], ["Good morning.", "Thank you.", "OK."]),
    alt("How are you today?", "说 I'm fine 或 Good", ["fine", "good", "happy", "i'm", "i am"], ["I'm fine.", "Good.", "I'm happy."])
  ]);
  put("enterSchool", 4, 0, [
    alt("Do you want to go to school now?", "说 Yes, I want to go 或 Let's go", ["yes", "want", "school", "go", "let's"], ["Yes, I want to go to school.", "Let's go to school.", "Yes, I want."]),
    alt("What class do we have today?", "说 English / maths / art", ["english", "math", "maths", "art", "class", "have"], ["We have English.", "Maths.", "Art class."]),
    alt("Shall we go into the classroom?", "说 Yes, let's go in", ["yes", "let's", "go", "in", "classroom"], ["Yes, let's go in.", "Let's go into the classroom.", "Yes, we shall."]),
    alt("Are you ready for class?", "说 Yes, I am ready", ["yes", "ready", "i am", "i'm", "class"], ["Yes, I am ready.", "I'm ready for class.", "Yes."])
  ]);
  put("enterSchool", 4, 1, [
    alt("Good morning. Please sit down.", "说 Good morning 或 Thank you", ["morning", "thank", "sit", "hello"], ["Good morning.", "Thank you.", "OK, I will sit down."]),
    alt("Please take out your book.", "说 OK 或 Here it is", ["ok", "okay", "book", "here", "yes"], ["OK.", "Here it is.", "Yes."]),
    alt("Who is your friend today?", "说 Leo / Mia / my friend", ["leo", "mia", "friend", "my"], ["Leo.", "Mia.", "My friend."])
  ]);
  put("enterSchool", 6, 0, [
    alt("Would you like to go to school now? Why?", "说 Yes, I want to go to school because…", ["yes", "want", "school", "because", "class", "go"], ["Yes, I want to go to school because I have a class.", "I want to go to school now.", "Yes, I want to go."]),
    alt("What will you do first in school today?", "说 I will… first", ["will", "first", "read", "write", "sit", "class"], ["I will sit down first.", "I will read first.", "I will go to class first."]),
    alt("Did you finish your homework? Shall we go in?", "说 Yes, I did / Let's go in", ["yes", "did", "homework", "let's", "go", "in"], ["Yes, I did. Let's go in.", "I finished my homework.", "Let's go in."])
  ]);
  put("enterSchool", 6, 1, [
    alt("Welcome back. Are you ready for class?", "说 Yes, I am ready 或 I think so", ["yes", "ready", "think", "class", "i am"], ["Yes, I am ready.", "I think so.", "Yes, I want to start."]),
    alt("Can you tell me one thing you learned yesterday?", "说 I learned…", ["learned", "learn", "english", "yesterday", "i"], ["I learned English.", "I learned a new word.", "I learned to say hello."])
  ]);

  put("borrow", 2, 0, [
    alt("Hi! What do you need?", "说 eraser, ruler 或 pencil", ["eraser", "ruler", "pencil", "pen", "borrow"], ["Eraser.", "Ruler.", "Pencil, please."]),
    alt("What colour is your pencil?", "说 red / blue / green", ["red", "blue", "green", "yellow", "colour", "color", "pencil"], ["It's red.", "Blue.", "Green."]),
    alt("How many pencils do you have?", "说 one / two / three", ["one", "two", "three", "pencil", "have"], ["Two.", "I have two.", "Three."]),
    alt("Do you like English class?", "说 Yes, I like it 或 Yes", ["yes", "like", "english", "no"], ["Yes.", "Yes, I like it.", "I like English."]),
    alt("Let's play after class. OK?", "说 OK / Yes / Let's play", ["ok", "okay", "yes", "play", "let's"], ["OK.", "Yes.", "Let's play."])
  ]);
  put("borrow", 4, 0, [
    alt("I have an eraser and a ruler. What do you need?", "说 May I borrow your eraser?", ["borrow", "may i", "eraser", "ruler", "pencil", "please"], ["May I borrow your eraser?", "May I borrow your ruler?", "Can I borrow a pencil, please?"]),
    alt("What subject do we have now?", "说 English / maths / PE", ["english", "math", "maths", "pe", "art", "subject"], ["English.", "We have maths.", "PE."]),
    alt("Can you help me find my book?", "说 Yes / It's on the desk", ["yes", "book", "desk", "on", "help"], ["Yes.", "It's on the desk.", "I can help you."]),
    alt("Do you want to sit with me?", "说 Yes, I do 或 Sure", ["yes", "sit", "sure", "ok", "want"], ["Yes, I do.", "Sure.", "Yes, I want to sit with you."])
  ]);
  put("borrow", 6, 0, [
    alt("Sure, I can help. What do you need it for?", "说明要借什么，以及用来做什么", ["borrow", "ruler", "eraser", "pencil", "math", "maths", "draw", "need"], ["May I borrow your ruler? I need it for maths.", "May I borrow your eraser? I need it to draw.", "I need a pencil for my homework."]),
    alt("Which book are you reading, and why?", "说 I'm reading… because…", ["reading", "book", "because", "like", "english"], ["I'm reading an English book because I like it.", "I am reading this book.", "I like this book."]),
    alt("What will you do at break time?", "说 I will play / talk / read", ["will", "play", "read", "talk", "break"], ["I will play football.", "I will read.", "I will talk with you."])
  ]);

  put("classAsk", 2, 0, [
    alt("What colour is the sky?", "说 blue 或 I think it's blue", ["blue", "think", "sky", "i don't know", "dont know"], ["Blue.", "I think it's blue.", "I don't know."]),
    alt("What colour is a banana?", "说 yellow 或 I think it's yellow", ["yellow", "banana", "think", "i don't know", "dont know"], ["Yellow.", "I think it's yellow.", "I don't know."]),
    alt("How many days are in a week?", "说 seven", ["seven", "week", "think", "i don't know", "dont know"], ["Seven.", "I think seven.", "I don't know."]),
    alt("What is this? It's a book. Can you say it?", "说 It's a book 或 Book", ["book", "it's", "it is"], ["It's a book.", "Book.", "This is a book."])
  ]);
  put("classAsk", 4, 0, [
    alt("What do you think? Can you say it again?", "说 I think… 或 Can you say that again?", ["think", "again", "i don't know", "dont know", "can you"], ["I think it is good.", "Can you say that again?", "I don't know."]),
    alt("Where do you live?", "说 I live in…", ["live", "city", "town", "home", "i"], ["I live in a city.", "I live at home.", "I live here."]),
    alt("When do you get up?", "说 I get up at…", ["get up", "seven", "six", "morning", "o'clock"], ["I get up at seven.", "At seven o'clock.", "In the morning."])
  ]);
  put("classAsk", 6, 0, [
    alt("Why do we go to school? What do you think?", "用 I think 和 because", ["think", "because", "learn", "school", "don't know", "dont know"], ["I think we go to school because we learn.", "I think it is important.", "I don't know. Can you say that again?"]),
    alt("What is your favourite subject, and why?", "说 My favourite is… because…", ["favourite", "favorite", "because", "english", "math", "art"], ["My favourite subject is English because it is fun.", "I like art because I can draw.", "English, because I can talk."]),
    alt("Can you tell us about your last weekend?", "用过去时：I played / I went", ["played", "went", "weekend", "last", "was"], ["I played football last weekend.", "I went to the park.", "It was fun."])
  ]);

  put("helloMia", 2, 0, [
    alt("Hi! What's your name?", "说出你的名字，或说 My name is…", ["name", "i am", "i'm", "hi", "hello"], ["My name is Xiaoyu.", "I am Xiaoyu.", "Hi!"]),
    alt("How old are you?", "说 I'm … years old", ["old", "eight", "nine", "ten", "eleven", "i'm", "i am"], ["I'm eight.", "I'm nine years old.", "I'm ten."]),
    alt("Do you like cats or dogs?", "说 cats / dogs / I like…", ["cat", "dog", "like", "cats", "dogs"], ["I like cats.", "Dogs.", "I like dogs."]),
    alt("What's your favourite colour?", "说 red / blue / green", ["red", "blue", "green", "yellow", "pink", "favourite", "favorite"], ["Blue.", "I like red.", "Green."])
  ]);
  put("helloMia", 4, 0, [
    alt("Hi! What's your name? What do you like?", "说名字，再加 I like…", ["name", "like", "i am", "hi"], ["My name is Xiaoyu. I like football.", "I like drawing.", "Hi, I am Xiaoyu."]),
    alt("Where are you from?", "说 I'm from…", ["from", "china", "city", "i'm", "i am"], ["I'm from China.", "I am from a city.", "I'm from here."]),
    alt("Can you play football?", "说 Yes, I can / No, I can't", ["can", "can't", "cannot", "yes", "no", "football"], ["Yes, I can.", "No, I can't.", "I can play football."])
  ]);
  put("helloMia", 6, 0, [
    alt("Nice to meet you. What do you like doing after school?", "说 I like … after school", ["like", "after", "school", "play", "read", "nice"], ["I like playing football after school.", "I like reading after school.", "Nice to meet you. I like drawing."]),
    alt("Tell me about your family.", "说 I have… / My mum…", ["family", "mum", "mom", "dad", "sister", "have"], ["I have a sister.", "My mum is kind.", "I have a small family."]),
    alt("What are you going to do this weekend?", "说 I'm going to…", ["going", "weekend", "play", "park", "home"], ["I'm going to the park.", "I'm going to stay at home.", "I'm going to play."])
  ]);

  put("veggies", 2, 0, [
    alt("Please go to the shopping mall to buy some veggies.", "先答应妈妈，可以说 OK 或 Sure", ["ok", "okay", "okey", "sure", "yes", "yeah", "i'll go", "i will go", "mum", "mom"], ["OK.", "Sure, Mum.", "Yes, I'll go."]),
    alt("We need fruit. Can you buy some apples?", "说 OK 或 Yes, apples", ["ok", "okay", "yes", "apple", "apples", "sure"], ["OK.", "Yes, apples.", "Sure."]),
    alt("Please buy some milk.", "说 OK 或 Milk, OK", ["ok", "okay", "milk", "yes", "sure"], ["OK.", "Milk, OK.", "Yes, Mum."])
  ]);
  put("veggies", 2, 1, [
    alt("Hello! What would you like?", "指一种蔬菜，说 carrots 或 tomatoes", ["carrot", "carrots", "tomato", "tomatoes", "veggie", "veggies", "spinach"], ["Carrots.", "Tomatoes.", "Veggies, please."]),
    alt("Do you want apples or bananas?", "说 apples 或 bananas", ["apple", "apples", "banana", "bananas"], ["Apples.", "Bananas.", "Apples, please."]),
    alt("We have milk and bread. What do you need?", "说 milk 或 bread", ["milk", "bread", "need", "please"], ["Milk.", "Bread.", "Milk, please."])
  ]);
  put("veggies", 4, 0, [
    alt("Please go to the shop and buy some tomatoes.", "说你要去买西红柿", ["tomato", "tomatoes", "buy", "shop", "ok", "okay", "sure", "yes"], ["OK, I'll buy some tomatoes.", "I need some tomatoes.", "Sure, I will go."]),
    alt("Can you buy some bread and milk?", "说 I'll buy bread and milk", ["bread", "milk", "buy", "yes", "ok"], ["I'll buy bread and milk.", "Yes, I can.", "OK, I will buy them."])
  ]);
  put("veggies", 6, 0, [
    alt("We need veggies for dinner. Can you go to the shop?", "不要只说 OK，要说买什么、买多少", ["tomato", "tomatoes", "spinach", "carrot", "carrots", "veggie", "veggies", "dinner", "two", "some"], ["I need two tomatoes and some spinach for dinner.", "I will buy some tomatoes and spinach.", "I need veggies for dinner."]),
    alt("What should we cook tonight?", "说 We can cook… / I want…", ["cook", "noodles", "rice", "soup", "want", "should"], ["We can cook rice.", "I want soup.", "We should cook noodles."])
  ]);

  put("breakfast", 2, 0, [
    alt("What would you like for breakfast?", "说一种食物：bread, milk, eggs, apple", ["bread", "milk", "egg", "eggs", "apple", "like", "i'd like"], ["Bread.", "Milk.", "I'd like eggs."]),
    alt("Do you want milk or juice?", "说 milk 或 juice", ["milk", "juice", "want"], ["Milk.", "Juice.", "I want milk."]),
    alt("Are you hungry?", "说 Yes 或 I'm hungry", ["yes", "hungry", "i'm", "i am"], ["Yes.", "I'm hungry.", "Yes, I am hungry."])
  ]);
  put("breakfast", 4, 0, [
    alt("What would you like for breakfast? We have bread, eggs and milk.", "用 I'd like 说出你想吃的", ["i'd like", "i like", "bread", "egg", "eggs", "milk", "please"], ["I'd like bread and milk.", "I'd like eggs, please.", "I like milk."]),
    alt("Would you like an apple or bread?", "说 I'd like…", ["i'd like", "apple", "bread", "please"], ["I'd like an apple.", "I'd like bread, please.", "An apple."])
  ]);
  put("breakfast", 6, 0, [
    alt("Breakfast time. What would you like, and why?", "说想吃什么，并加上 because", ["because", "i'd like", "i like", "bread", "egg", "milk", "hungry", "healthy"], ["I'd like eggs because I am hungry.", "I'd like bread and milk because they are yummy.", "I like milk because it is healthy."]),
    alt("What did you eat yesterday morning?", "用过去时：I ate…", ["ate", "yesterday", "bread", "egg", "milk"], ["I ate bread yesterday.", "I ate eggs.", "I ate bread and milk."])
  ]);

  put("chores", 2, 0, [
    alt("Can you help me, please?", "说 Yes 或 I can help", ["yes", "help", "can", "ok", "okay"], ["Yes.", "I can help.", "OK."]),
    alt("Please wash the cups.", "说 OK 或 Yes", ["ok", "okay", "yes", "wash"], ["OK.", "Yes.", "I will wash."]),
    alt("Is the table clean?", "说 Yes / No / I can clean it", ["yes", "no", "clean", "table"], ["Yes.", "No.", "I can clean it."])
  ]);
  put("findBag", 2, 0, [
    alt("Where is your bag?", "说 on the sofa / in the kitchen / under the table", ["sofa", "kitchen", "table", "on", "in", "under", "bag"], ["On the sofa.", "In the kitchen.", "Under the table."]),
    alt("Where is my book?", "说 on the sofa / in the kitchen", ["book", "sofa", "kitchen", "on", "in", "under"], ["On the sofa.", "In the kitchen.", "Under the table."]),
    alt("Is your bag on the chair?", "说 Yes / No / It's on the sofa", ["yes", "no", "sofa", "chair", "on"], ["Yes.", "No.", "It's on the sofa."])
  ]);
  put("dadTalk", 2, 0, [
    alt("How are you today?", "说 I'm fine 或 Happy", ["fine", "happy", "good", "ok", "i'm", "i am"], ["I'm fine.", "I'm happy.", "Good."]),
    alt("Did you have fun?", "说 Yes / It was fun", ["yes", "fun", "did", "good"], ["Yes.", "It was fun.", "Yes, I did."]),
    alt("What do you like, football or reading?", "说 football 或 reading", ["football", "reading", "like"], ["Football.", "Reading.", "I like football."])
  ]);
  put("bedtime", 2, 0, [
    alt("How do you feel? Good night.", "说 Happy / Tired 和 Good night", ["happy", "tired", "good night", "night", "fine"], ["I'm happy. Good night.", "I'm tired.", "Good night."]),
    alt("Are you sleepy?", "说 Yes / I'm sleepy / Good night", ["yes", "sleepy", "tired", "night"], ["Yes.", "I'm sleepy.", "Good night."]),
    alt("What did you like today?", "说 I like… / Jumping / School", ["like", "jump", "school", "play", "today"], ["I like jumping.", "School.", "I like playing."])
  ]);

  put("jump", 2, 0, [
    alt("Let's go outside and jump!", "说 OK, let's go 或 Yes", ["ok", "okay", "yes", "go", "outside", "jump", "let's"], ["OK, let's go!", "Yes.", "Let's go outside."]),
    alt("Do you want to run or jump?", "说 run / jump", ["run", "jump", "want"], ["Jump.", "Run.", "I want to jump."]),
    alt("Can you come to the yard?", "说 Yes / OK", ["yes", "ok", "okay", "come", "yard"], ["Yes.", "OK.", "I can come."])
  ]);
  put("rain", 2, 0, [
    alt("It's raining! Shall we go home?", "说 yes, go home 或 home", ["yes", "home", "go", "ok", "okay", "shall"], ["Yes.", "Go home!", "OK, let's go home."]),
    alt("It's cold. Do you want your coat?", "说 Yes / I want my coat", ["yes", "coat", "want", "cold"], ["Yes.", "I want my coat.", "Yes, please."]),
    alt("Look! Is it sunny or rainy?", "说 rainy / sunny", ["rainy", "sunny", "rain"], ["Rainy.", "It's rainy.", "Sunny."])
  ]);

  put("checkout", 2, 0, [
    alt("That's five yuan, please.", "说 please, five 或 here you are", ["please", "five", "yuan", "here", "thank"], ["Five yuan, please.", "Here you are.", "Thank you."]),
    alt("That's three yuan, please.", "说 three 或 here you are", ["please", "three", "yuan", "here", "thank"], ["Three yuan, please.", "Here you are.", "Thank you."]),
    alt("Do you need a bag?", "说 Yes / No, thank you", ["yes", "no", "bag", "thank"], ["Yes.", "No, thank you.", "Yes, please."])
  ]);
  put("snack", 2, 0, [
    alt("Hello! What would you like?", "说 ice cream / juice / cake", ["ice", "cream", "juice", "cake", "please"], ["Ice cream.", "Juice, please.", "Cake."]),
    alt("Hot or cold?", "说 hot / cold", ["hot", "cold"], ["Hot.", "Cold.", "I want it cold."]),
    alt("One ice cream or two?", "说 one / two", ["one", "two", "ice", "cream"], ["One.", "Two.", "One, please."])
  ]);

  put("lesson", 2, 0, [
    alt("Let's start the class.", "", ["ok", "okay", "yes", "start", "begin", "ready", "let's", "lets"], ["OK.", "Yes.", "Let's start."]),
    alt("Class is starting. Let's begin.", "", ["ok", "okay", "yes", "start", "begin", "ready", "let's", "lets"], ["OK.", "Yes.", "Let's begin."]),
    alt("Sit down, please. Let's start the class.", "", ["ok", "okay", "yes", "start", "sit", "ready"], ["OK.", "Yes.", "I'm ready."])
  ]);
  put("lesson", 2, 1, [
    alt("Class begins. What's this? It's a book. Can you say it?", "说 It's a book 或 Book", ["book", "it's", "it is", "this"], ["It's a book.", "Book.", "This is a book."]),
    alt("I like apples. What do you like?", "说 I like…", ["like", "apple", "banana", "cat", "dog"], ["I like apples.", "I like cats.", "I like dogs."]),
    alt("How many pencils? One, two, three.", "说 three 或 I see three", ["one", "two", "three", "pencil"], ["Three.", "I see three.", "Two."]),
    alt("Is this a cat? Yes or no?", "说 Yes, it is / No, it isn't", ["yes", "no", "cat", "is"], ["Yes, it is.", "No, it isn't.", "Yes."]),
    alt("Touch your nose. What is this?", "说 nose / eyes / mouth", ["nose", "eye", "eyes", "mouth", "ear"], ["Nose.", "It's my nose.", "Eyes."]),
    alt("Please say hello to your friend.", "说 Hello / Hi", ["hello", "hi", "friend"], ["Hello.", "Hi.", "Hello, my friend."]),
    alt("Where is the bag? On the desk.", "说 On the desk / Under the desk", ["on", "under", "desk", "bag"], ["On the desk.", "Under the desk.", "It's on the desk."])
  ]);
  put("lesson", 4, 0, [
    alt("Good morning. Let's start the class.", "", ["ok", "okay", "yes", "start", "begin", "ready", "morning", "let's", "lets"], ["OK.", "Good morning.", "Let's start."]),
    alt("Let's begin our English class.", "", ["ok", "okay", "yes", "start", "begin", "ready", "let's", "lets"], ["OK.", "Yes.", "Let's begin."]),
    alt("Are you ready? Let's start.", "", ["ok", "okay", "yes", "ready", "start", "let's", "lets"], ["Yes.", "I'm ready.", "Let's start."])
  ]);
  put("lesson", 4, 1, [
    alt("What are you doing now? Please use -ing.", "说 I'm sitting / I'm listening", ["sitting", "listening", "reading", "doing", "i'm", "i am"], ["I'm sitting.", "I'm listening.", "I am reading."]),
    alt("There are two books on the desk. How many books?", "说 There are two books", ["there", "two", "books", "are"], ["There are two books.", "Two books.", "There are two."]),
    alt("Can you swim? Please answer with can.", "说 Yes, I can / No, I can't", ["can", "can't", "cannot", "yes", "no", "swim"], ["Yes, I can.", "No, I can't.", "I can swim."]),
    alt("Whose bag is this?", "说 It's mine / It's my bag", ["mine", "my", "bag", "it's"], ["It's mine.", "It's my bag.", "It's his bag."]),
    alt("Don't run in the classroom. What should you do?", "说 I should walk / Sorry", ["should", "walk", "sorry", "don't", "run"], ["I should walk.", "Sorry.", "I will walk."]),
    alt("Is there a playground at school?", "说 Yes, there is", ["there", "is", "yes", "playground"], ["Yes, there is.", "There is a playground.", "Yes."])
  ]);
  put("lesson", 6, 0, [
    alt("Good morning, class. Let's start today's lesson.", "", ["ok", "okay", "yes", "start", "begin", "ready", "morning", "let's", "lets"], ["OK.", "Good morning.", "Let's start."]),
    alt("Take out your books. Let's begin.", "", ["ok", "okay", "yes", "start", "begin", "book", "ready"], ["OK.", "Yes.", "Let's begin."]),
    alt("Quiet, please. Let's start the class.", "", ["ok", "okay", "yes", "start", "quiet", "ready"], ["OK.", "Yes.", "I'm ready."])
  ]);
  put("lesson", 6, 1, [
    alt("What did you do yesterday? Please use the past tense.", "说 I played / I went / I did", ["played", "went", "did", "yesterday", "was"], ["I played football yesterday.", "I went to school.", "I did my homework."]),
    alt("I'm going to play basketball after class. What are you going to do?", "说 I'm going to…", ["going", "after", "play", "read", "home"], ["I'm going to play basketball.", "I'm going to read.", "I'm going home."]),
    alt("Which is bigger, a cat or a tiger?", "说 A tiger is bigger", ["bigger", "tiger", "than", "cat"], ["A tiger is bigger.", "A tiger is bigger than a cat.", "The tiger."]),
    alt("Why do we learn English? Please use because.", "说 We learn English because…", ["because", "learn", "english", "talk", "useful"], ["We learn English because it is useful.", "Because we can talk to friends.", "I learn English because I like it."]),
    alt("If you are late, what should you do?", "说 I should say sorry / I should hurry", ["should", "sorry", "hurry", "late"], ["I should say sorry.", "I should hurry.", "I should not be late."]),
    alt("Could you tell me the way to the playground?", "说 Go straight / It's next to the classroom", ["straight", "next", "playground", "left", "right"], ["Go straight.", "It's next to the classroom.", "Turn left."])
  ]);

  put("ballAsk", 2, 0, [
    alt("We are playing basketball. Can I play?", "说 Yes / Let's play", ["yes", "play", "ok", "let's", "basketball"], ["Yes.", "Let's play.", "OK."]),
    alt("Do you like basketball?", "说 Yes, I like it", ["yes", "like", "basketball", "no"], ["Yes.", "Yes, I like it.", "I like basketball."]),
    alt("Catch the ball!", "说 OK / I can", ["ok", "catch", "ball", "can"], ["OK.", "I can.", "Catch!"])
  ]);
  put("ballAsk", 4, 0, [
    alt("Can I play basketball with you?", "说 Yes, you can / Let's play together", ["yes", "can", "play", "together", "sure", "let's", "basketball"], ["Yes, you can.", "Let's play together.", "Sure."]),
    alt("Are you good at basketball?", "说 Yes, I am / I'm OK", ["yes", "good", "at", "ok", "i'm"], ["Yes, I am.", "I'm OK.", "I'm good at basketball."]),
    alt("Shall we play a game?", "说 Yes, let's play", ["yes", "shall", "let's", "play"], ["Yes, let's play.", "Let's play a game.", "Yes."])
  ]);
  put("ballAsk", 6, 0, [
    alt("Could I join your game? I can play as a guard.", "说 Yes, you can join / Let's play together", ["could", "join", "can", "play", "guard", "yes", "together"], ["Yes, you can join.", "Let's play together.", "Sure, you can be a guard."]),
    alt("Have you played basketball before?", "说 Yes, I have / I played last week", ["have", "played", "before", "yes", "week"], ["Yes, I have.", "I played last week.", "I have played before."]),
    alt("We need one more player. Would you like to join us?", "说 Yes, I'd like to join", ["yes", "join", "would", "like", "i'd"], ["Yes, I'd like to join.", "I would like to join you.", "Yes, I will join."])
  ]);

  put("ballPass", 2, 0, [
    alt("Pass the ball! Shoot!", "说 Pass / Shoot / OK", ["pass", "shoot", "ball", "ok", "yes"], ["Pass!", "Shoot!", "OK."]),
    alt("Bounce the ball.", "说 OK / Bounce", ["bounce", "ball", "ok"], ["OK.", "Bounce.", "I can bounce."])
  ]);
  put("ballPass", 4, 0, [
    alt("Pass me the ball, please. Then you can shoot.", "说 Pass me the ball / I can shoot", ["pass", "ball", "please", "shoot", "can"], ["Pass me the ball, please.", "I can shoot.", "Here you are."]),
    alt("Don't hold the ball. Run!", "说 OK / I will run", ["run", "ok", "hold", "will"], ["OK.", "I will run.", "Run!"])
  ]);
  put("ballPass", 6, 0, [
    alt("If I pass to you, what will you do next?", "说 I will shoot / I will pass it back", ["will", "shoot", "pass", "back", "then"], ["I will shoot.", "I will pass it back.", "I will run and then shoot."]),
    alt("You should pass, not walk with the ball. What is the rule?", "说 I should pass / Don't walk with the ball", ["should", "pass", "walk", "rule", "don't"], ["I should pass.", "Don't walk with the ball.", "I should not walk with the ball."])
  ]);

  put("libraryAsk", 2, 0, [
    alt("Please be quiet. What book do you like?", "说 animal / story / this book", ["quiet", "animal", "story", "book", "like", "this"], ["This book.", "I like story books.", "Animal book."]),
    alt("Is this a story book?", "说 Yes, it is", ["yes", "story", "book", "it is"], ["Yes, it is.", "Yes.", "It's a story book."])
  ]);
  put("libraryAsk", 4, 0, [
    alt("Can I help you? You can borrow one book.", "说 Can I borrow this book?", ["borrow", "book", "please", "can", "this"], ["Can I borrow this book?", "This book, please.", "I want to borrow a book."]),
    alt("How long can you keep the book?", "说 Two weeks / One week", ["week", "weeks", "two", "one", "keep"], ["Two weeks.", "One week.", "I can keep it for two weeks."])
  ]);
  put("libraryAsk", 6, 0, [
    alt("What kind of book are you looking for, and why?", "说 I'm looking for… because…", ["looking", "story", "science", "because", "animal", "book"], ["I'm looking for a story book because I like stories.", "I want a science book.", "I'm looking for an animal book."]),
    alt("Have you read this book before?", "说 Yes, I have / Not yet", ["have", "read", "before", "yet", "no"], ["Yes, I have.", "Not yet.", "I haven't read it before."])
  ]);

  put("clinicAsk", 2, 0, [
    alt("How do you feel today?", "说 I have a cold / My head hurts / I'm fine", ["feel", "cold", "head", "hurt", "fine", "sick", "ok"], ["I have a cold.", "My head hurts.", "I'm fine."]),
    alt("Does your tummy hurt?", "说 Yes / No / A little", ["yes", "no", "tummy", "hurt", "stomach", "little"], ["Yes.", "No.", "A little."]),
    alt("Open your mouth, please. Say ah.", "说 Ah / OK", ["ah", "ok", "okay", "yes", "open"], ["Ah.", "OK.", "Yes."])
  ]);
  put("clinicAsk", 4, 0, [
    alt("What's wrong? Do you have a headache?", "说 I have a headache / I feel sick", ["headache", "sick", "fever", "cold", "hurt", "feel"], ["I have a headache.", "I feel sick.", "I have a cold."]),
    alt("Do you have a fever or a cough?", "说 I have a fever / I have a cough", ["fever", "cough", "have", "cold"], ["I have a fever.", "I have a cough.", "I have a cold."]),
    alt("Where does it hurt?", "说 My head / My tummy / My throat", ["head", "tummy", "throat", "hurt", "stomach"], ["My head hurts.", "My tummy hurts.", "My throat hurts."])
  ]);
  put("clinicAsk", 6, 0, [
    alt("How long have you felt like this? Can you tell me more?", "说 I have… because… / since yesterday", ["have", "because", "yesterday", "fever", "headache", "since", "feel"], ["I have a fever since yesterday.", "I have a headache because I didn't sleep.", "I feel sick."]),
    alt("What should you do when you are sick?", "说 I should rest / drink water", ["should", "rest", "drink", "water", "sleep", "doctor"], ["I should rest.", "I should drink water.", "I should see a doctor."])
  ]);

  put("cafeOrder", 2, 0, [
    alt("Hello! What would you like?", "说 noodles / rice / water", ["noodle", "noodles", "rice", "water", "please", "like"], ["Noodles, please.", "Rice.", "Water, please."]),
    alt("Soup or noodles?", "说 soup / noodles", ["soup", "noodle", "noodles"], ["Soup.", "Noodles.", "Noodles, please."]),
    alt("Do you want chopsticks?", "说 Yes / No, thank you", ["yes", "no", "chopsticks", "thank"], ["Yes.", "No, thank you.", "Yes, please."])
  ]);
  put("cafeOrder", 4, 0, [
    alt("Would you like noodles or rice?", "说 I'd like… please", ["i'd like", "i like", "noodle", "noodles", "rice", "please", "water"], ["I'd like noodles, please.", "I'd like rice, please.", "Water, please."]),
    alt("Anything to drink?", "说 I'd like water / juice", ["drink", "water", "juice", "i'd like", "please"], ["I'd like water, please.", "Juice, please.", "I'd like juice."])
  ]);
  put("cafeOrder", 6, 0, [
    alt("What would you like to eat, and what would you like to drink?", "说 I'd like… and…", ["i'd like", "noodle", "rice", "water", "juice", "and", "please"], ["I'd like noodles and water, please.", "I'd like rice and juice.", "Noodles and water, please."]),
    alt("How spicy would you like it, and why?", "说 Not spicy / A little because…", ["spicy", "because", "little", "hot", "not"], ["Not spicy, please.", "A little spicy because I like it.", "Not hot, please."])
  ]);

  put("parkPlay", 2, 0, [
    alt("Shall we play?", "说 Yes / Let's play", ["yes", "play", "ok", "let's", "lets"], ["Yes.", "Let's play.", "OK."]),
    alt("Look! A bird. What is it?", "说 bird / It's a bird", ["bird", "it", "look"], ["Bird.", "It's a bird.", "A bird."]),
    alt("Can you run to the tree?", "说 Yes / I can", ["yes", "run", "tree", "can", "ok"], ["Yes.", "I can.", "OK."])
  ]);
  put("parkPlay", 4, 0, [
    alt("What can you see in the park?", "说 I can see…", ["see", "bird", "flower", "tree", "can"], ["I can see a bird.", "I can see flowers.", "I can see a tree."]),
    alt("Shall we play on the swing or run?", "说 Let's play on the swing / Let's run", ["swing", "run", "play", "let's"], ["Let's play on the swing.", "Let's run.", "The swing."])
  ]);
  put("parkPlay", 6, 0, [
    alt("What shall we play, and why?", "说 Let's play… because…", ["let's", "lets", "play", "because", "hide", "football", "run"], ["Let's play football because it's fun.", "Let's run because I like it.", "Shall we play hide and seek?"]),
    alt("Where is a safe place to play, and why?", "说 Near the tree because…", ["near", "tree", "safe", "because", "road", "away"], ["Near the tree because it is safe.", "Away from the road.", "Here, because I can see you."])
  ]);

  put("busRide", 2, 0, [
    alt("Where are you going?", "说 school / home / park", ["school", "home", "shop", "park", "clinic", "cafe", "library", "playground", "restaurant", "hospital", "going"], ["School.", "Home.", "The park."]),
    alt("One ticket, please. Where to?", "说 school / park / home", ["ticket", "school", "park", "home", "please"], ["School, please.", "The park.", "Home."]),
    alt("Is this seat free?", "说 Yes / Please sit", ["yes", "seat", "free", "sit", "please"], ["Yes.", "Please sit.", "Yes, it is free."])
  ]);
  put("busRide", 4, 0, [
    alt("Where are you going? Please say I'm going to…", "说 I'm going to the park", ["going", "school", "home", "shop", "park", "library", "clinic", "cafe", "playground", "restaurant"], ["I'm going to the park.", "I'm going home.", "I'm going to school."]),
    alt("How many stops to the school?", "说 Two stops / Three", ["two", "three", "one", "stop", "stops", "school"], ["Two stops.", "Three.", "One stop."])
  ]);
  put("busRide", 6, 0, [
    alt("Where are you going, and why?", "说 I'm going to… because…", ["going", "because", "school", "library", "home", "park", "clinic", "cafe", "shop"], ["I'm going to the park because I want to play.", "I'm going to school because I have a class.", "I'm going home because it's late."]),
    alt("If you miss this bus, what will you do?", "说 I will wait / I will walk", ["will", "wait", "walk", "next", "bus"], ["I will wait for the next bus.", "I will walk.", "I will call my mum."])
  ]);

  put("findDog", 2, 0, [
    alt("I lost my dog! What colour is it?", "说 brown / black / white / yellow", ["brown", "black", "white", "yellow", "colour", "color", "dog"], ["Brown.", "Black.", "It's white."]),
    alt("Is your dog brown?", "说 Yes / No / It's black", ["yes", "no", "brown", "black", "white", "dog"], ["Yes.", "No.", "It's black."]),
    alt("Call the dog. Say come here!", "说 Come here / Come", ["come", "here", "dog"], ["Come here!", "Come!", "Come here, dog!"])
  ]);
  put("findDog", 4, 0, [
    alt("My dog is lost. Is it big or small? What colour?", "说 It's a big brown dog / small white dog", ["big", "small", "brown", "black", "white", "yellow", "dog", "colour", "color"], ["It's a big brown dog.", "It's a small white dog.", "It's black and small."]),
    alt("Does it have long ears or short ears?", "说 long ears / short ears", ["long", "short", "ear", "ears"], ["Long ears.", "Short ears.", "It has long ears."])
  ]);
  put("findDog", 6, 0, [
    alt("Can you describe my dog? Colour, size, and where did you see it?", "说 It's a… dog. I saw it near…", ["brown", "black", "white", "yellow", "big", "small", "dog", "saw", "tree", "near", "park", "because"], ["It's a small brown dog. I saw it near the tree.", "It's a big black dog near the flowers.", "I saw a white dog by the gate."]),
    alt("What should we do if we find a lost dog?", "说 We should tell… / take it…", ["should", "tell", "help", "owner", "police", "take"], ["We should tell an adult.", "We should help the owner.", "We should take it to the gate."])
  ]);

  put("birthday", 2, 0, [
    alt("It's my birthday! Say happy birthday!", "说 Happy birthday", ["happy", "birthday", "happy birthday"], ["Happy birthday!", "Happy birthday, Lily!", "Happy birthday to you!"]),
    alt("How old am I today? Guess!", "说 eight / nine / ten", ["eight", "nine", "ten", "eleven", "old"], ["Eight.", "Nine.", "Ten."]),
    alt("Blow out the candles with me!", "说 OK / Yes / Blow", ["ok", "okay", "yes", "blow", "candle"], ["OK.", "Yes.", "Blow!"])
  ]);
  put("birthday", 4, 0, [
    alt("It's my birthday party! Can you come?", "说 Yes / I'd love to", ["yes", "come", "party", "sure", "love", "ok"], ["Yes, I can come.", "I'd love to.", "Sure!"])
  ]);
  put("birthday", 4, 1, [
    alt("What present do you like? A book or a ball?", "说 I'd like a book / a ball", ["book", "ball", "like", "i'd like", "present", "gift"], ["I'd like a book.", "I'd like a ball.", "A book, please."]),
    alt("Shall we sing the birthday song?", "说 Yes / Let's sing", ["yes", "sing", "song", "let's", "birthday"], ["Yes.", "Let's sing.", "Happy birthday song!"])
  ]);
  put("birthday", 6, 0, [
    alt("Today is my birthday. What did you get for me, and why?", "说 I got… because…", ["got", "get", "because", "book", "ball", "cake", "gift", "present"], ["I got a book because you like reading.", "I got a ball because we can play.", "I got a cake because it's your birthday."]),
    alt("Who will you invite to your next party, and why?", "说 I will invite… because…", ["invite", "because", "friend", "mia", "leo", "will"], ["I will invite Mia because she is kind.", "I will invite Leo because we play together.", "My friends, because it's fun."])
  ]);

  put("cheer", 2, 0, [
    alt("Ken is running! Say come on!", "说 Come on / You can do it", ["come", "on", "can", "do", "it", "go"], ["Come on!", "You can do it!", "Go, Ken!"]),
    alt("Clap your hands and cheer!", "说 Come on / Clap", ["come", "on", "clap", "cheer", "go"], ["Come on!", "Clap!", "Go!"])
  ]);
  put("cheer", 4, 0, [
    alt("Which sport is it, running or jumping?", "说 running / jumping", ["run", "running", "jump", "jumping", "sport"], ["Running.", "Jumping.", "It's running."]),
    alt("Is it a race or a game?", "说 race / game", ["race", "game", "sport"], ["A race.", "A game.", "It's a race."])
  ]);
  put("cheer", 4, 1, [
    alt("Now cheer for them!", "说 Come on / You can do it", ["come", "on", "can", "do", "it", "go", "cheer"], ["Come on!", "You can do it!", "Go!"])
  ]);
  put("cheer", 6, 0, [
    alt("Ken looks tired. What will you say to cheer him up, and why?", "说 You can do it because… / Come on…", ["can", "do", "come", "because", "strong", "try", "cheer", "run"], ["You can do it because you are strong.", "Come on, Ken! You can finish.", "Don't give up because you can do it."]),
    alt("How do teammates help each other?", "说 They cheer / They help…", ["cheer", "help", "together", "team", "should"], ["They cheer for each other.", "They help each other.", "We should play together."])
  ]);

  put("askWay", 2, 0, [
    alt("Looking for milk? It's on the left. Can you say left?", "说 left / on the left", ["left", "right", "milk", "on"], ["Left.", "On the left.", "It's on the left."]),
    alt("The bread is on the right. Say right.", "说 right / on the right", ["right", "left", "bread", "on"], ["Right.", "On the right.", "It's on the right."]),
    alt("Go straight, please. Can you say straight?", "说 straight / Go straight", ["straight", "go", "please"], ["Straight.", "Go straight.", "Go straight, please."])
  ]);
  put("askWay", 4, 0, [
    alt("Excuse me, can I help you?", "说 Excuse me. Where is the bread?", ["excuse", "where", "bread", "milk", "fruit", "apple", "please"], ["Excuse me. Where is the bread?", "Where is the milk, please?", "Where are the apples?"]),
    alt("The fruit is next to the milk. Where is the fruit?", "说 Next to the milk / On the left", ["next", "milk", "left", "right", "fruit"], ["Next to the milk.", "On the left.", "It's next to the milk."])
  ]);
  put("askWay", 6, 0, [
    alt("Where do you want to go in the shop, and how will you get there?", "说 I want… Go straight / Turn left…", ["want", "fruit", "bread", "milk", "left", "right", "straight", "turn", "next"], ["I want the fruit. Go straight and turn left.", "I want bread. It's next to the milk.", "Turn right to the apple shelf."]),
    alt("If you get lost in a big shop, what should you do?", "说 I should ask… / find…", ["should", "ask", "help", "clerk", "mum", "mom", "find"], ["I should ask the clerk.", "I should find my mum.", "I should ask for help."])
  ]);

  put("friendOver", 2, 0, [
    alt("Mia is here! Say hello!", "说 Hello / Hi, Mia", ["hello", "hi", "mia", "come"], ["Hello!", "Hi, Mia!", "Hello, come in."]),
    alt("Take off your shoes, please.", "说 OK / Yes", ["ok", "okay", "yes", "shoes"], ["OK.", "Yes.", "OK, I will."]),
    alt("Do you want some juice?", "说 Yes / No, thank you", ["yes", "no", "juice", "thank", "want"], ["Yes.", "No, thank you.", "Yes, please."])
  ]);
  put("friendOver", 4, 0, [
    alt("Mia is coming to our home. Shall we give her some snacks?", "说 Yes / Let's give her cake", ["yes", "snack", "cake", "juice", "give", "let's", "ok"], ["Yes.", "Let's give her some cake.", "OK, juice."])
  ]);
  put("friendOver", 4, 1, [
    alt("What shall we play, cards or football?", "说 Let's play…", ["play", "cards", "football", "let's", "ball"], ["Let's play cards.", "Let's play football.", "Football!"]),
    alt("Shall we draw or read together?", "说 Let's draw / Let's read", ["draw", "read", "let's", "together"], ["Let's draw.", "Let's read.", "Let's draw together."])
  ]);
  put("friendOver", 6, 0, [
    alt("Mia is at the door. How shall we welcome her?", "说 Come in / Welcome / Nice to see you", ["come", "in", "welcome", "nice", "see", "hello"], ["Come in, please.", "Welcome to our home.", "Nice to see you, Mia."]),
    alt("What house rules should we tell our friend?", "说 Take off shoes / Be quiet…", ["shoes", "quiet", "please", "should", "rule"], ["Take off your shoes, please.", "Please be quiet near grandma.", "Wash your hands, please."])
  ]);
  put("friendOver", 6, 1, [
    alt("What shall we play, and what snack shall we share?", "说 Let's play… and share…", ["play", "share", "snack", "cake", "juice", "cards", "football", "because"], ["Let's play cards and share some cake.", "Let's play football and drink juice.", "We can read and share snacks."])
  ]);

  put("washHands", 2, 0, [
    alt("Wash your hands, please.", "说 OK / I will wash", ["ok", "okay", "wash", "hands", "yes"], ["OK.", "I will wash.", "Yes, Mum."]),
    alt("Use soap, please.", "说 OK / Soap", ["ok", "okay", "soap", "yes", "wash"], ["OK.", "Soap.", "Yes."])
  ]);
  put("washHands", 4, 0, [
    alt("Dinner is ready. Did you wash your hands?", "说 Yes, I did / I washed my hands", ["yes", "wash", "washed", "hands", "did"], ["Yes, I did.", "I washed my hands.", "Yes, Mum."]),
    alt("How long should you wash your hands?", "说 Twenty seconds / A little", ["twenty", "seconds", "long", "wash", "little"], ["Twenty seconds.", "A little.", "For twenty seconds."])
  ]);
  put("washHands", 6, 0, [
    alt("Why should we wash our hands before dinner?", "说 Because… / To keep clean", ["because", "clean", "germs", "wash", "hands", "healthy"], ["Because we should keep clean.", "To wash away germs.", "Because it is healthy."]),
    alt("When else should you wash your hands?", "说 After… / Before…", ["after", "before", "toilet", "play", "eat", "wash"], ["After I play outside.", "Before I eat.", "After I use the toilet."])
  ]);

  put("packBag", 2, 0, [
    alt("What do you need in your bag?", "说 book / pencil / eraser", ["book", "pencil", "eraser", "ruler", "bag", "need"], ["A book.", "A pencil.", "An eraser."]),
    alt("Don't forget your water bottle.", "说 OK / I won't forget", ["ok", "okay", "water", "bottle", "forget", "yes"], ["OK.", "I won't forget.", "Yes, Dad."])
  ]);
  put("packBag", 4, 0, [
    alt("Pack your bag. What do you need for school?", "说 I need… for school", ["need", "book", "pencil", "eraser", "ruler", "school"], ["I need a book and a pencil.", "I need an eraser for school.", "I need my ruler."]),
    alt("Is your homework in the bag?", "说 Yes / It's in the bag", ["yes", "homework", "bag", "in"], ["Yes.", "It's in the bag.", "Yes, it is."])
  ]);
  put("packBag", 6, 0, [
    alt("What will you put in your bag first, and why?", "说 I will put… first because…", ["put", "first", "because", "book", "pencil", "bag", "will"], ["I will put my book first because it is heavy.", "I will put my pencil first.", "First my book, then my pencil."]),
    alt("What happens if you forget your book?", "说 I can borrow / I should…", ["forget", "borrow", "should", "ask", "teacher", "friend"], ["I can borrow a book.", "I should ask my friend.", "I should tell the teacher."])
  ]);

  put("waterPlant", 2, 0, [
    alt("The plant is thirsty. Can you water it?", "说 Yes / OK / I can", ["yes", "ok", "okay", "water", "can", "plant"], ["Yes.", "OK.", "I can water it."]),
    alt("Give the plant some water.", "说 OK / Some water", ["ok", "okay", "water", "plant", "some"], ["OK.", "Some water.", "Yes."])
  ]);
  put("waterPlant", 4, 0, [
    alt("How much water does the plant need?", "说 a little / some water", ["little", "some", "water", "much", "plant"], ["A little water.", "Some water.", "Not too much."]),
    alt("Should we water it every day?", "说 Yes / No / Sometimes", ["yes", "no", "every", "day", "sometimes", "water"], ["Yes.", "No.", "Sometimes."])
  ]);
  put("waterPlant", 6, 0, [
    alt("Why do plants need water?", "说 Because… / They need water to grow", ["because", "grow", "need", "water", "plant", "alive"], ["Because they need water to grow.", "Plants need water to live.", "Because water helps them grow."]),
    alt("What else do plants need besides water?", "说 Sunlight / Light / Soil", ["sun", "sunlight", "light", "soil", "air", "need"], ["Sunlight.", "They need sunlight.", "Soil and light."])
  ]);

  put("chores", 4, 0, [
    alt("Can you help me? First wash, then dry.", "说 First… then… 或 Yes, I can", ["first", "then", "help", "yes", "wash", "dry"], ["First wash, then dry.", "Yes, I can help.", "OK, first then then."]),
    alt("Please put the cups on the table.", "说 OK / On the table", ["ok", "okay", "table", "cups", "put", "on"], ["OK.", "On the table.", "I will put them on the table."]),
    alt("Can you sweep the floor?", "说 Yes, I can / OK", ["yes", "sweep", "floor", "can", "ok"], ["Yes, I can.", "OK.", "I can sweep the floor."])
  ]);
  put("chores", 6, 0, [
    alt("Can you help me with dinner? What can you do first?", "说 I can… first, then…", ["can", "first", "then", "help", "wash", "cut"], ["I can wash the veggies first, then cut them.", "I can help you with dinner.", "First I can wash, then I can dry."]),
    alt("Why is it good to help at home?", "说 Because… / It helps…", ["because", "help", "family", "kind", "together"], ["Because it helps my family.", "Because we work together.", "It is kind to help."])
  ]);
  put("bedtime", 4, 0, [
    alt("Are you happy or tired? Say good night.", "说 I am… Good night", ["happy", "tired", "good night", "night", "i am", "i'm"], ["I am tired. Good night.", "I am happy. Good night.", "Good night, Grandma."]),
    alt("Did you brush your teeth?", "说 Yes, I did / I brushed my teeth", ["yes", "brush", "brushed", "teeth", "did"], ["Yes, I did.", "I brushed my teeth.", "Yes."])
  ]);
  put("bedtime", 6, 0, [
    alt("How do you feel tonight, and why?", "说 I feel… because… Good night", ["feel", "because", "happy", "tired", "night", "good"], ["I feel happy because I played.", "I feel tired because I went to school.", "I feel good. Good night."]),
    alt("What will you dream about?", "说 I will dream about…", ["dream", "will", "play", "school", "dog", "park"], ["I will dream about the park.", "I will dream about playing.", "I don't know."])
  ]);
  put("dadTalk", 4, 0, [
    alt("What do you like doing?", "说 I like…", ["like", "play", "read", "draw", "football"], ["I like football.", "I like reading.", "I like drawing."]),
    alt("Who is your best friend at school?", "说 Leo / Mia / my friend", ["leo", "mia", "friend", "best"], ["Leo.", "Mia.", "My best friend is Leo."])
  ]);
  put("dadTalk", 6, 0, [
    alt("How was your day? What did you do?", "用过去时：I played / I went…", ["was", "played", "went", "did", "school", "good"], ["It was good. I went to school.", "I played with my sister.", "I did my homework."]),
    alt("What was the best part of your day, and why?", "说 The best part was… because…", ["best", "because", "played", "school", "friend", "was"], ["The best part was playing because it was fun.", "School, because I learned English.", "Seeing my friend."])
  ]);
  put("findBag", 4, 0, [
    alt("I can't find your bag. Where is it?", "说 It's on / in / under…", ["it's", "its", "sofa", "kitchen", "table", "on", "in", "under"], ["It's on the sofa.", "It's in the kitchen.", "It's under the table."]),
    alt("Is it behind the sofa or under the chair?", "说 Behind the sofa / Under the chair", ["behind", "under", "sofa", "chair"], ["Behind the sofa.", "Under the chair.", "It's behind the sofa."])
  ]);
  put("findBag", 6, 0, [
    alt("Where did you put your bag, and why is it there?", "说 I put it… because…", ["put", "sofa", "kitchen", "because", "on", "in", "under"], ["I put it on the sofa because I was tired.", "It's under the table because I was playing.", "I put it in the kitchen."]),
    alt("How can we keep from losing things?", "说 Put them… / Always…", ["put", "always", "place", "bag", "same", "remember"], ["Put them in the same place.", "Always put the bag by the door.", "I should remember."])
  ]);
  put("snack", 4, 0, [
    alt("Would you like ice cream or juice?", "说 I'd like… please", ["i'd like", "i like", "ice", "juice", "please", "cream"], ["I'd like ice cream, please.", "I'd like juice, please.", "Ice cream, please."]),
    alt("Do you want a big one or a small one?", "说 A big one / A small one", ["big", "small", "one", "want"], ["A big one.", "A small one.", "Small, please."])
  ]);
  put("snack", 6, 0, [
    alt("What would you like, and how many?", "说 I'd like two… please", ["i'd like", "two", "one", "please", "ice", "juice"], ["I'd like two ice creams, please.", "I'd like one juice, please.", "Two, please."]),
    alt("Is it for you or to share?", "说 For me / To share with…", ["share", "me", "sister", "friend", "for"], ["For me.", "To share with my sister.", "For my friend."])
  ]);
  put("jump", 4, 0, [
    alt("Let's go outside. I want to jump!", "说 Let's go 或 OK", ["ok", "okay", "yes", "go", "outside", "jump", "let's"], ["Let's go outside.", "OK, let's jump.", "Yes, I want to jump."]),
    alt("Put on your shoes first.", "说 OK / I will", ["ok", "okay", "shoes", "will", "yes"], ["OK.", "I will.", "Yes."])
  ]);
  put("rain", 4, 0, [
    alt("It's raining. Shall we go home or play a little more?", "建议一句：Let's go home 或 Let's play", ["home", "play", "shall", "let's", "go"], ["Let's go home.", "Shall we go home?", "Let's play a little more."]),
    alt("Do we need an umbrella?", "说 Yes / We need an umbrella", ["yes", "umbrella", "need", "no"], ["Yes.", "We need an umbrella.", "Yes, please."])
  ]);
  put("rain", 6, 0, [
    alt("It's raining hard. What should we do?", "说计划：We should go home 或 We can play…", ["should", "home", "can", "let's", "because", "rain"], ["We should go home now.", "Let's go home because it is raining hard.", "We can play in the rain for a minute."]),
    alt("What do you wear on a rainy day?", "说 A coat / Rain boots / An umbrella", ["coat", "boots", "umbrella", "rain", "wear"], ["A coat.", "Rain boots.", "An umbrella."])
  ]);
  put("veggies", 4, 1, [
    alt("Hello! Can I help you?", "问价钱，或说 I need some tomatoes", ["how much", "tomato", "tomatoes", "need", "please"], ["How much are the tomatoes?", "I need some tomatoes.", "Tomatoes, please."]),
    alt("We also have carrots today.", "说 Carrots, please / I need carrots", ["carrot", "carrots", "please", "need"], ["Carrots, please.", "I need carrots.", "Some carrots."])
  ]);
  put("checkout", 4, 0, [
    alt("How many apples? They are three yuan.", "说数量：two please，或问 How much", ["two", "three", "one", "how much", "apple", "apples", "please", "yuan"], ["Two, please.", "How much are the apples?", "Three yuan, please."]),
    alt("Do you want a plastic bag or a cloth bag?", "说 A cloth bag / Plastic bag", ["cloth", "plastic", "bag", "want"], ["A cloth bag.", "A plastic bag.", "Cloth bag, please."])
  ]);
  put("checkout", 6, 0, [
    alt("These tomatoes are six yuan. How would you like to pay?", "把价钱说完整：Here you are / Six yuan, please", ["six", "yuan", "here", "please", "pay", "thank"], ["Here you are. Six yuan, please.", "I'll take them. Here you are.", "Six yuan, please. Thank you."]),
    alt("Would you like a receipt?", "说 Yes, please / No, thank you", ["yes", "no", "receipt", "please", "thank"], ["Yes, please.", "No, thank you.", "Yes."])
  ]);
  put("helloMia", 4, 0, [
    alt("Hi! What's your name? What do you like?", "说名字，再加 I like…", ["name", "like", "i am", "hi"], ["My name is Xiaoyu. I like football.", "I like drawing.", "Hi, I am Xiaoyu."]),
    alt("Where are you from?", "说 I'm from…", ["from", "china", "city", "i'm", "i am"], ["I'm from China.", "I am from a city.", "I'm from here."]),
    alt("Can you play football?", "说 Yes, I can / No, I can't", ["can", "can't", "cannot", "yes", "no", "football"], ["Yes, I can.", "No, I can't.", "I can play football."]),
    alt("What's your favourite animal?", "说 I like… / Cats / Dogs", ["cat", "dog", "panda", "favourite", "favorite", "like"], ["I like cats.", "Dogs.", "Pandas."])
  ]);
  put("ballTurn", 2, 0, [
    alt("It's your turn! Are you ready?", "说 Yes / My turn / I'm ready", ["yes", "turn", "ready", "i'm", "ok"], ["Yes.", "My turn!", "I'm ready."]),
    alt("Wait for your turn, please.", "说 OK / I can wait", ["ok", "okay", "wait", "turn", "yes"], ["OK.", "I can wait.", "Yes."])
  ]);
  put("ballTurn", 4, 0, [
    alt("Whose turn is it? Can you wait a minute?", "说 It's my turn / I can wait", ["turn", "wait", "my", "your", "can"], ["It's my turn.", "I can wait.", "It's your turn."]),
    alt("After you shoot, whose turn is next?", "说 Your turn / Ken's turn", ["turn", "your", "ken", "amy", "next"], ["Your turn.", "Ken's turn.", "It's your turn."])
  ]);
  put("ballTurn", 6, 0, [
    alt("How many points did you get? Who scored more?", "说 I got… / I scored more", ["points", "got", "scored", "more", "than", "two", "three"], ["I got two points.", "I scored more.", "I got three points."]),
    alt("Was it a fair game? Why?", "说 Yes because… / We took turns", ["fair", "because", "turns", "yes", "no"], ["Yes, because we took turns.", "Yes, it was fair.", "We all played."])
  ]);
})();

