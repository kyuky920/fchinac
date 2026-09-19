/**
 * Text copied from the read-only legacy source and `legacy_import` database.
 * Keep this module free of database imports so parity tests can load it directly.
 */

export const legacyHistoryDates = [
  "2015.10.22", "2013.07.15", "2012.10.25", "2010.06.01",
  "2010.03.02", "2002.04.12", "2018.09.20", "2000.03", "1999.12.09",
  "1990.03.05", "1969.04.01", "1960", "1952.09", "1946.09.20",
] as const;

export const legacyHistoryEvents = {
  ko: [
    "미국 Puritan Reformed University 에게 인정받음",
    "www.abcts.org 개설",
    "한국어(중국어통역)의 동영상 강의 완료",
    "홈페이지에 한국어(중국어통역)의 동영상 강의와 중국어로 된 신학서적을 올리기 시작함",
    "안디옥성경사이버선교회 & 신학원 설립(설립자: 朴滉雨 박사)",
    "www.fchinac.org 개설",
    "계약신학연구원으로 개명",
    "계약신학대학원대학교 개교",
    "계약신학대학원대학교(Kyeyak Graduate School of Theology)(한국 경기도 광주 소재) 한국 교육부 인가 취득",
    "계약신학원(서울 서대문구 창천동 소재) 개교",
    "계약신학교(서울 서대문구 창천동 소재) 개교",
    "대한예수교장로회(계신) 공의회 조직(이병규 목사 중심으로)",
    "대한예수교장로회(고려파) 설립",
    "고려신학교 개교(한국 부산에서)",
  ],
  "zh-CN": [
    "得到美国 Puritan Reformed University 大学院认可",
    "开设 www.abcts.org",
    "完成韩国语（中文口译）的影像讲课",
    "开始在网页上上传韩国语（中文口译）的影像讲课与中文神学书籍 ",
    "创办安提阿圣经网络神学院(创办人: 朴滉雨 博士)",
    "开设 www.fchinac.org ",
    "改名为契约神学研究院",
    "创办成立契约神学大学院大学 ",
    "契约神学大学院大学校(Kyeyak Graduate School of Theology)(韩国京畿道广州) 得到韩国教育部的许可",
    "创办契约神学院(首尔西大门区 仓川洞) ",
    "创办契约神学校(首尔西大门区 仓川洞 ) ",
    "组织大韩耶稣教长老会(契神测) 公议会(以李炳奎牧师为中心)",
    "成立大韩耶稣教长老会(高丽派)",
    "创办高丽神学校 (于韩国釜山)",
  ],
} as const;

export const legacyChurchHistoryDates = [
  "2026.01 ∼", "2010.12 ∼ 2026.01", "2004.02 ∼ 2010.12", "1994.07 ∼ 2004.02",
  "1998.01.03", "1986.08 ∼ 1994.07", "1975.10.14",
] as const;

export const legacyChurchHistoryEvents = {
  ko: ["김재현 목사 시무중", "박황우 목사 시무", "채희근 목사 시무", "이창옥 목사 시무", "성전건축 & 이전(가락동 42-1), 가락동부교회로 개명", "고석남 목사 시무", "잠실동부교회 설립(김중섭 목사; 송파구 잠실2동 소재)"],
  "zh-CN": ["金在贤牧师任职中", "朴滉雨牧师任职", "蔡熙根牧师事务", "李昌玉牧师事务", "圣殿建筑 & 搬迁(可乐洞42-1), 改名为可乐东部教会", "高錫南牧师事务 ", "蚕室东部教会成立（金重燮牧师）; 所在地 松坡区蚕室二洞"],
} as const;

export const legacyFamilySites = [
  { href: "http://www.fchinac.org", image: "/legacy/images/linksite_01.png", label: "Antioch Bible Cyber Theological Seminary" },
  { href: "http://www.abctsm.org", image: "/legacy/images/linksite_02.png", label: "Antioch Bible Cyber School Mongolia" },
  { href: "http://www.abcts.org", image: "/legacy/images/linksite_03.png", label: "Antioch Bible Cyber Theological Seminary" },
  { href: "http://www.garakdb.org", image: "/legacy/images/linksite_04.png", label: "가락동부교회" },
] as const;

export const membershipNoticeCopy = {
  ko: ["로그인하고 공부하시오.", "본 선교회의 강의 동영상을 외장하드(메모리)에 저장하여 보급하고 있으며, 그 동영상을 현지에서 모니터로 회원들에게 신학(성경)공부를 시킬 수 있습니다.", "당신이 사용하는 언어가 우리 강의에서 번역이 안되어 있는 경우에는, 우리의 영어로 된 강의 동영상을 AI자막 또는 번역 앱 또는 더빙 앱을 사용하여 번역하십시오. 또는 \"강의록\"에 들어가서 영어로된 \"강의 워드 파일\"을 번역하여 사용하시오.", "공부를 마친 자에게는 수료증을 수여합니다. 그리고 학위 또는 졸업장을 받으시려면 본 선교회로 연락하시면 자세한 안내를 받으실 수 있습니다.", "만일 회원이 비성서적인 주장을 하거나 이단과 사이비한 사상을 주장하면 공부했던 모든 근거를 지우고, 제명 처리합니다."],
  "zh-CN": ["请登录后学习。", "提供外置硬盘（存储器）: 可将本宣教会的讲课视频存储在外置硬盘（存储器）中进行推广. 在当地可用显示器让会员们学习神学（圣经）.", "如果我们的课程没有提供您所使用语言的翻译，请使用 AI 字幕、翻译应用程序或配音应用程序翻译我们的英语讲课视频。或者进入“讲义”，翻译并使用英语“讲课 Word 文件”。", "对学习完成者颁发结业证书. 如果想要拿学位或毕业证，请联系本宣教会获取详细介绍.", "如发现会员主张非圣书性的或异端邪说思想，则进行除名处理. 另外，学习结束后，如果发现提出非圣书性的主张或异端邪说思想，则删除所学过的所有根据，并进行除名处理."],
  en: ["Sign in before studying.", "The mission distributes lecture videos on external drives or memory devices so members can study theology and the Bible locally using a monitor.", "If your language is not available in our lectures, translate our English lecture videos using AI captions, a translation app, or a dubbing app. Alternatively, open \"Lecture Notes\" and translate the English \"lecture Word file\" for use.", "A certificate of completion is awarded to those who finish their studies. Contact the mission for information about degrees or diplomas.", "Members who advocate unbiblical, cultic, or heretical teachings will have their study records removed and their membership terminated."],
} as const;

export const legacyProfessors = [
  ["Dr. Hyo Cheon Jo", "Chung Ang University(B.S.; Pharmacist)|Faith Theological Seminary(M.A.)|Reformed Theological Seminary(D.Min.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Back June Chang", "Kyeyak Graduate School of Theology(M.Div., Th.M.)|Philadelphia Biblical University(M.S.B.)|Bob Jones University|Faith Theological Seminary(Th.D.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Seong Nam Koh", "Hanyang University(B.T.)|Tokyo Technical Graduate School(M.S.T.)|Faith Theological Seminary(D.Min.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Chinuk Hong", "Korea University(B.E.)|Kyeyak Graduate School of Theology(M.Div.)|Southwestern Baptist Theological Seminary(Th.M.)|Bob Jones University(Ph.D.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Hyo Sung Kim", "Yonsei University|Chongshin University|Faith Theological Seminary(Th.M.)|Bob Jones University(Ph.D.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Joon Bum Kim", "Asia United Theological University(B.Th.)|Free Church of Scotland College(Dip. in Th.)|Greenville Presbyterian Theological Seminary(Th.M., Th.D.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Jeong-Wook Shin", "Kookmin University(B.A., M.A.)|Korea Reformed Theological Seminary(M.Div.)|Asia United Theological University(Th.M.)|R.S.A. University of Pretoria(Ph.D.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Jung Ju Kang", "Dankook University(B.E.)|Reformed(Gae Shin) Theological Seminary(M.Div.)|University of Gloucestershire(M.A., Ph.D.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Hee Kun Chae", "Ulsan University(B.S.)|Cairn University(MBS)|Seoul Bible Graduate School of Theology(Th.M)|Faith Theological Seminary(D.Min.)|Kyeyak Graduate School of Theology Professor"],
  ["Dr. Jin Gun Seok", "Hankuk University of Foreign Studies(B.A.)|Kyeyak Graduate School of Theology(M.Div., Th.M.)|Hapdong Theological Seminary(Ph.D.)|Kyeyak Theological Seminary Professor"],
  ["Rev. Se Deok Park", "Kwangwoon University(B.S.)|Yonsei University(M.S.)|Kyeyak Graduate School of Theology(M.Div., Th.M.)|Kyeyak Theological Seminary Professor|Pastor, Myungryun Church"],
  ["Rev. Sung Ho Nam", "Sogang University(B.A.)|Kyeyak Graduate School of Theology(M.Div., Th.M.)|Kyeyak Theological Seminary Professor|Pastor, Sanjung Church"],
  ["Rev. Yong Joo Lee", "Kyeyak Theological School(B.Th.)|Hankook Pastoral Clinic Seminary(Counsellor)|Chongshin University(M.Div.)|Pastor, Songtan Northern Church"],
  ["Rev. Eoun Ki Rah", "Oakland City University(B.A.)|Kyeyak Graduate School of Theology(M.Div., Th.M.)|Kyeyak Theological Seminary Professor|Pastor, Songjung Church"],
  ["Rev. Dong Sak Gwak", "Chungnam National University(B.A.)|Kyeyak Graduate School of Theology(M.Div., Th.M.)|Pastor, Seokwang Church"],
  ["Rev. Jae Chang Han", "Oakland City University(B.A.)|Kyeyak Graduate School of Theology(M.Div., Th.M.)|Pastor, Zion Seongsan Church"],
  ["Rev. You Chang Lee", "Hanyang Cyber University(B.A.)|Kyeyak Theological Seminary(M.Div.)|Pastor, Moonjung Eastern Church|Reformed Faith Theological College Seminary(D.Miss)"],
  ["Rev. Jino Suk", "Kyeyak Theological School(B.Th.)|Kyeyak Theological Seminary(M.Div.)|Pastor, Bondong Church"],
  ["Rev. Yung Il Cho", "Kyeyak Theological School(B.Th.)|Kyeyak Theological Seminary Professor|Pastor, Goen Church"],
  ["Rev. Young Gil Yoo", "Kyeyak Theological School(B.Th.)|Kyeyak Theological Seminary Professor|Pastor, Sangdaewon Church"],
  ["Rev. Cheong Soo Lee", "Kyeyak Theological School(B.Th.)|Kyeyak Theological Seminary Professor|Pastor, Bakyang Church"],
] as const;

export const legacyLectureCategories = [
  { key: "guyak", slug: "old-testament", ko: "구약신학", zh: "旧约神学", en: "Old Testament" },
  { key: "sinyak", slug: "new-testament", ko: "신약신학", zh: "新约神学", en: "New Testament" },
  { key: "yuksa", slug: "history", ko: "역사신학", zh: "历史神学", en: "Historical Theology" },
  { key: "jojik", slug: "systematic", ko: "조직신학", zh: "系统神学", en: "Systematic Theology" },
  { key: "silchun", slug: "practical", ko: "실천신학", zh: "实践神学", en: "Practical Theology" },
  { key: "sungyo", slug: "mission", ko: "선교신학", zh: "宣教神学", en: "Missiology" },
] as const;

type Lecture = readonly [code: string, ko: string, zh: string, count: number];

export const legacyLectures: Record<(typeof legacyLectureCategories)[number]["slug"], readonly Lecture[]> = {
  "old-testament": [
    ["OT4001", "히브리어", "希伯来语", 8], ["OT3003", "성경신학", "圣经神学", 8], ["OT3005", "구약개론", "旧约概论", 8],
    ["OT1001", "모세오경Ⅰ(창)", "摩西五经Ⅰ(创)", 10], ["OT1002", "모세오경Ⅱ(출)", "摩西五经 Ⅱ(出)", 10], ["OT1003", "모세오경Ⅲ(레)", "摩西五经 Ⅲ(利)", 7],
    ["OT1005", "모세오경Ⅳ(신)", "摩西五经 Ⅳ(申)", 9], ["OT1006", "여호수아연구", "约书亚记", 10], ["OT1008", "룻기연구", "路得记", 2],
    ["OT1009", "사무엘상하연구", "撒母耳记上下", 9], ["OT1010", "열왕기상하연구", "列王纪上下", 10], ["OT1011", "에스라느헤미야연구", "以斯拉尼希米记", 8],
    ["OT1012", "시가서연구Ⅰ(시)", "诗歌书Ⅰ(诗)", 8], ["OT1014", "시가서연구Ⅱ(전,아)", "诗歌书Ⅱ(传,歌)", 10], ["OT1015", "대선지서Ⅰ(사)", "大先知书Ⅰ(赛)", 8],
    ["OT1016", "대선지서Ⅱ(렘)", "大先知书Ⅱ(耶)", 10], ["OT1017", "다니엘연구", "但以现书", 7], ["OT1018", "소선지서Ⅰ", "小先知书Ⅰ", 9], ["OT1019", "소선지서Ⅱ ", "小先知书Ⅱ", 6],
  ],
  "new-testament": [
    ["NT4002", "헬라어", "希腊语", 8], ["NT3006", "신약개론", "新约概论", 10], ["NT3018", "성경해석학", "释经学", 3],
    ["NT2001", "공관복음Ⅰ(마)", "共观福音Ⅰ(太)", 10], ["NT2002", "공관복음Ⅱ(눅)", "共观福音 Ⅱ(路)", 10], ["NT2003", "요한신학", " 约翰神学", 10],
    ["NT2004", "사도행전연구", "使徒行传", 10], ["NT2005", "바울신학(롬)", "保罗神学(罗)", 8], ["NT2006", "고린도전후서연구", "哥林多前后书", 11],
    ["NT2007", "갈라디아서연구", "加拉太书", 3], ["NT2008", "옥중서신", "狱中书信", 9], ["NT2009", "바울서신(살전후)", "保罗书信(帖前后)", 3],
    ["NT2010", "목회서신(딤전후)", "教牧书信(提前后)", 7], ["NT2011", "히브리서연구", "希伯来书", 7], ["NT2012", "공동서신Ⅰ(약)", "普通书信Ⅰ(雅)", 3],
    ["NT2013", "공동서신Ⅱ(벧전후)", "普通书信Ⅱ(彼前后)", 6], ["NT2014", "공동서신Ⅲ(요일이삼)", "普通书信Ⅲ(约一二三)", 5], ["NT2015", "유다서연구", "犹大书", 1], ["NT2016", "요한계시록연구", "约翰启示录", 9],
  ],
  history: [["CH3002", "교회사", "教会史", 10]],
  systematic: [["ST3001", "조직신학", "系统神学", 10], ["ST3010", "기독교윤리", "基督教伦理", 5], ["ST3012", "현대신학비판", "现代神学批判", 3]],
  practical: [["PT3007", "교회정치(헌법)", "教会行政(宪法)", 4], ["PT3008", "목회학", "教牧学", 4], ["PT3011", "설교학", "讲道学", 7], ["MT3013", "전도학", "传道学", 3]],
  mission: [["MT3009", "비교종교학", "比較宗教学", 4], ["MT3017", "선교학", "宣教学", 5]],
};

export const legacyContact = {
  ko: { address: "서울 송파구 오금로 34길 46", disclaimer: "안디옥성경사이버선교회의 콘텐츠(동영상 서적 프린트물 등)를 허가 없이 전재 방송하거나 무단으로 복사 배포 판매 전사 제작한 경우 민형사상 책임이 따를 수 있습니다." },
  "zh-CN": { address: "首尔松坡区梧琴路34路46街", disclaimer: "安提阿圣经网络宣教会的内容（视频、书籍、印刷品等）未经许可转载播放或擅自复制发行、销售、转印制作的情况，可能会承担民事、刑事责任。" },
  en: { address: "46, Ogeum-ro 34-gil, Songpa-gu, Seoul", disclaimer: "Unauthorized reproduction, broadcasting, distribution, sale, transcription, or production of ABCMISSION content may result in civil or criminal liability." },
} as const;
