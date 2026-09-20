export const locales = ["ko", "en", "zh-CN", "mn", "es"] as const;
export type KnownLocale = (typeof locales)[number];
export type Locale = string;

export function isLocale(value: string): value is Locale {
  return /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(value);
}

export function knownLocale(value: string): KnownLocale {
  return locales.includes(value as KnownLocale) ? value as KnownLocale : "en";
}

const rtlLocales = new Set(["ar", "fa"]);

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.has(locale.split("-")[0].toLowerCase());
}

const dictionaries = {
  ko: {
    siteName: "안디옥성경사이버선교회",
    home: "홈",
    boards: "게시판",
    admin: "관리",
    adminConsole: "관리자 화면",
    login: "로그인",
    register: "회원가입",
    logout: "로그아웃",
    signedIn: "로그인 중",
    welcome: "말씀과 자료를 나누는 온라인 공간입니다.",
    recentPosts: "최근 게시물",
    noPosts: "등록된 게시물이 없습니다.",
    attachments: "첨부파일",
    previous: "이전",
    next: "다음",
    writePost: "게시물 작성",
  },
  en: {
    siteName: "Antioch Bible Cyber Mission",
    home: "Home",
    boards: "Boards",
    admin: "Admin",
    adminConsole: "Admin console",
    login: "Sign in",
    register: "Register",
    logout: "Sign out",
    signedIn: "Signed in",
    welcome: "An online space for sharing Scripture and resources.",
    recentPosts: "Recent posts",
    noPosts: "There are no posts yet.",
    attachments: "Attachments",
    previous: "Previous",
    next: "Next",
    writePost: "Write post",
  },
  "zh-CN": {
    siteName: "安提阿圣经网络宣教会",
    home: "首页",
    boards: "资料板",
    admin: "管理",
    adminConsole: "管理后台",
    login: "登录",
    register: "注册",
    logout: "退出",
    signedIn: "已登录",
    welcome: "分享圣经话语与资料的网络空间。",
    recentPosts: "最新文章",
    noPosts: "暂无文章。",
    attachments: "附件",
    previous: "上一页",
    next: "下一页",
    writePost: "撰写文章",
  },
  mn: {
    siteName: "Антиох Библийн цахим номлол",
    home: "Нүүр",
    boards: "Самбар",
    admin: "Удирдлага",
    adminConsole: "Удирдлагын хэсэг",
    login: "Нэвтрэх",
    register: "Бүртгүүлэх",
    logout: "Гарах",
    signedIn: "Нэвтэрсэн",
    welcome: "Библийн үг болон материалыг хуваалцах цахим орон зай.",
    recentPosts: "Сүүлийн нийтлэл",
    noPosts: "Нийтлэл алга байна.",
    attachments: "Хавсралт",
    previous: "Өмнөх",
    next: "Дараах",
    writePost: "Нийтлэл бичих",
  },
  es: {
    siteName: "Misión Bíblica Cibernética de Antioquía",
    home: "Inicio",
    boards: "Foros",
    admin: "Administración",
    adminConsole: "Panel de administración",
    login: "Iniciar sesión",
    register: "Registrarse",
    logout: "Cerrar sesión",
    signedIn: "Sesión iniciada",
    welcome: "Un espacio para compartir la Biblia y recursos.",
    recentPosts: "Publicaciones recientes",
    noPosts: "No hay publicaciones.",
    attachments: "Archivos adjuntos",
    previous: "Anterior",
    next: "Siguiente",
    writePost: "Crear publicación",
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[knownLocale(locale)];
}

export function formatDate(value: Date | string, locale: Locale): string {
  let language = locale;
  try { new Intl.Locale(locale); } catch { language = "ko"; }
  return new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
