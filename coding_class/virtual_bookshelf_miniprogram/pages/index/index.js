const COLORS = [
  "#7b2d26", "#1f4e5f", "#2e5a3c", "#8a5a12",
  "#3d2b56", "#6b2d5b", "#254e70", "#5c3317",
  "#8c2f39", "#1b4332", "#4a3f35", "#0f4c5c"
];
const SHELF_CAPACITY = 10;
const STORAGE_KEY = "virtual-bookshelf-books";

function pad(num) {
  return num < 10 ? "0" + num : "" + num;
}

function formatTime(iso) {
  const date = new Date(iso);
  return (
    date.getFullYear() + "-" +
    pad(date.getMonth() + 1) + "-" +
    pad(date.getDate()) + " " +
    pad(date.getHours()) + ":" +
    pad(date.getMinutes())
  );
}

function colorForTitle(title) {
  let sum = 0;
  for (let i = 0; i < title.length; i++) {
    sum += title.charCodeAt(i);
  }
  return COLORS[sum % COLORS.length];
}

function loadBooks() {
  try {
    const books = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(books) ? books : [];
  } catch (err) {
    return [];
  }
}

Page({
  data: {
    title: "",
    author: "",
    books: [],
    shelves: [],
    stats: "书架上还没有书。",
    showModal: false,
    selected: {}
  },

  onLoad() {
    this.books = loadBooks();
    this.refresh();
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onAuthorInput(event) {
    this.setData({ author: event.detail.value });
  },

  saveBooks() {
    wx.setStorageSync(STORAGE_KEY, this.books);
  },

  refresh() {
    const books = this.books;
    const shelfCount = Math.max(3, Math.ceil(books.length / SHELF_CAPACITY) || 3);
    const shelves = [];

    for (let i = 0; i < shelfCount; i++) {
      const slice = books.slice(i * SHELF_CAPACITY, (i + 1) * SHELF_CAPACITY);
      shelves.push({
        id: "shelf-" + i,
        empty: slice.length === 0,
        hint: i === 0 && books.length === 0
          ? "这层还是空的，输入书名后点「放到书架」"
          : "这层还可以继续放书",
        books: slice
      });
    }

    this.setData({
      shelves,
      stats: books.length ? "书架上现在有 " + books.length + " 本书。" : "书架上还没有书。"
    });

    this.books.forEach((book) => {
      book.justAdded = false;
    });
  },

  addBook() {
    const title = (this.data.title || "").trim();
    if (!title) {
      wx.showToast({ title: "请先输入书名", icon: "none" });
      return;
    }

    this.books.push({
      id: Date.now() + "-" + Math.random().toString(16).slice(2),
      title,
      author: (this.data.author || "").trim(),
      color: colorForTitle(title),
      addedAt: new Date().toISOString(),
      justAdded: true
    });

    this.saveBooks();
    this.setData({ title: "", author: "" });
    this.refresh();
  },

  openBook(event) {
    const id = event.currentTarget.dataset.id;
    const book = this.books.find((item) => item.id === id);
    if (!book) return;

    this.selectedId = id;
    this.setData({
      showModal: true,
      selected: {
        title: book.title,
        authorText: book.author ? "作者：" + book.author : "作者：未填写",
        timeText: "放入时间：" + formatTime(book.addedAt)
      }
    });
  },

  hideModal() {
    this.selectedId = null;
    this.setData({ showModal: false, selected: {} });
  },

  removeBook() {
    this.books = this.books.filter((book) => book.id !== this.selectedId);
    this.saveBooks();
    this.hideModal();
    this.refresh();
  },

  clearShelf() {
    if (!this.books.length) return;
    wx.showModal({
      title: "清空书架",
      content: "确定要把书架上的书全部拿走吗？",
      success: (res) => {
        if (!res.confirm) return;
        this.books = [];
        this.saveBooks();
        this.refresh();
      }
    });
  },

  noop() {}
});
