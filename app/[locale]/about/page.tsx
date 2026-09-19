import { notFound } from "next/navigation";
import { knownLocale } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero } from "@/app/[locale]/_components/legacy-subpage";

const labels = {
  ko: ["회장 인사말", "연혁"], en: ["President's Greeting", "History"], "zh-CN": ["会长致辞", "沿革"], mn: ["Тэргүүний мэндчилгээ", "Түүх"], es: ["Saludo del presidente", "Historia"],
} as const;

const copy = {
  ko: {
    scripture: ["사데 교회의 사자에게 편지하라", "하나님의 일곱 영과 일곱 별을 가지신 이가 이르시되", "내가 네 행위를 아노니", "네가 살았다 하는 이름은 가졌으나 죽은 자로다", "계 3:1"],
    title: ["성경의 진리를 세우고,", "성경에 능통한 목회자를 양성하고,", "복음을 전파합니다."],
    paragraphs: [
      "오늘날 교회들이 사데교회와 같이(계 3:1) 살았다 하는 이름은 있으나 생명력이 죽어가며, 신신학(자유주의)과 그릇된 신비주의로 기울어지고 있는 현실입니다. 이러한 때에 참으로 진리를 세워나가면서 능력있는 목회자를 양성하는 것이 무엇보다도 중요합니다.",
      "안디옥성경사이버선교회는 성경의 진리를 세워나가며, 능력있는 목회자와 생명을 살리는 목회자를 양성하는 선교회입니다.",
      "우리 선교회는 성경을 깊게 가르쳐서 말씀으로 무장시켜 성경에 능통한 목회자를 양성하려는 목표를 삼고 있습니다. 또한 기도를 많이 하게 하여 성령과 능력이 충만한 목회자를 양성하려고 합니다. 그리하여 하나님을 경외하고 경건하며, 덕망(德望)있는 목회자를 양성하려고 합니다.",
      "그러므로 뜨겁게 하나님을 사랑하며, 복음을 위해 헌신 충성하려고 하는 분들에게 우리 선교회는 언제나 문이 활짝 열려있습니다. 아무쪽록 많은 신자들이 가입하여 하나님의 영광을 위하여, 하나님의 나라의 확장과 복음 전파에 크게 쓰임받는 회원들이 되시기 바랍니다. 감사합니다.",
    ],
    signer: "회장 김재현 박사",
  },
  en: {
    scripture: ["Write to the angel of the church in Sardis.", "These are the words of him who holds the seven spirits of God and the seven stars.", "I know your deeds;", "you have a reputation of being alive, but you are dead.", "Revelation 3:1"],
    title: ["Establishing biblical truth,", "training pastors fluent in Scripture,", "and proclaiming the gospel."],
    paragraphs: ["Churches today face weakened spiritual life and confusion. At such a time, establishing truth and training capable pastors is more important than ever.", "Antioch Bible Cyber Mission establishes biblical truth and trains pastors who serve and give life.", "We teach Scripture deeply, encourage prayer, and seek to train pastors filled with the Holy Spirit, power, reverence, and godly character.", "Our doors are open to those who love God and desire to devote themselves to the gospel. We welcome you to join us in expanding God's kingdom."],
    signer: "President Dr. Jae-Hyun Kim",
  },
  "zh-CN": {
    scripture: ["经句介绍", "写信给撒狄教会的使者", "那有神的七灵和七星的说", "我知道你的行为", "啓 3:1"],
    title: ["建立圣经的真理，", "培养精通圣经的牧会者，", "传播福音。"],
    paragraphs: ["现今时代，众多教会正如撒狄教会（启3:1）一样，按名是活着的，但却失去了生命力，倾颓于新神学与错谬的神秘主义.。在这样的现实中，坚固真道，培养富有生命力的教会牧者，比任何事都重要. 安提阿圣经网络宣教会是坚固真道，培养满有生命的牧会者、拯救人的牧会者的宣教会.。", "我们宣教会立定于将圣经话语细致深入的讲解，以将人培养成为用神道装备、精通圣经的牧会者.。", "不但如此，我们也定意使学员多多祈祷，以栽培出充满圣灵和能力的牧会者，由此栽培出一批批敬畏神，敬虔而又品德高尚的牧会者.。", "因此，安提阿圣经网络宣教会面向那些热爱神、立志为福音献身的人，敞开大门.盼望众多主内肢体入学，为神的荣耀，在拓展神国、传扬福音方面，大大被神使用！谢谢！"],
    signer: "会长 金在贤 博士",
  },
  mn: { scripture: ["Сардис дахь чуулганы тэнгэр элчид бич.", "Бурханы долоон Сүнс болон долоон одыг баригч ийн хэлэв.", "Би чиний үйлсийг мэднэ.", "Чи амьд гэсэн нэртэй боловч үхсэн байна.", "Илчлэл 3:1"], title: ["Библийн үнэнийг тогтоож,", "Судрыг сайн мэддэг пасторуудыг бэлтгэж,", "Сайн мэдээг тунхаглана."], paragraphs: ["Өнөөдрийн чуулганд үнэнийг бататгаж, чадвартай пасторуудыг бэлтгэх нь нэн чухал байна.", "Антиохын Библийн цахим номлол нь Библийн үнэнийг тогтоож, амь өгдөг пасторуудыг бэлтгэдэг.", "Бид Судрыг гүнзгий зааж, залбирал болон итгэлээр үйлчлэгчдийг бэлтгэнэ.", "Бурханыг хайрлаж, сайн мэдээнд өөрийгөө зориулах хүн бүрд бидний үүд нээлттэй."], signer: "Тэргүүн Dr. Jae-Hyun Kim" },
  es: { scripture: ["Escribe al ángel de la iglesia en Sardis.", "El que tiene los siete espíritus de Dios y las siete estrellas dice esto.", "Yo conozco tus obras.", "Tienes nombre de que vives, y estás muerto.", "Apocalipsis 3:1"], title: ["Establecemos la verdad bíblica,", "formamos pastores conocedores de las Escrituras", "y proclamamos el evangelio."], paragraphs: ["Hoy es más importante que nunca establecer la verdad y formar pastores capaces.", "La Misión Bíblica Cibernética de Antioquía establece la verdad bíblica y forma pastores que dan vida.", "Enseñamos profundamente las Escrituras y fomentamos la oración para formar líderes llenos del Espíritu Santo.", "Nuestras puertas están abiertas a quienes aman a Dios y desean dedicarse al evangelio."], signer: "Presidente Dr. Jae-Hyun Kim" },
} as const;

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const baseLocale = knownLocale(locale);
  const base = copy[baseLocale];
  const defaults: Record<string, string> = { "about.tab.greeting": labels[baseLocale][0], "about.tab.history": labels[baseLocale][1], "about.signer": base.signer };
  base.scripture.forEach((value, index) => { defaults[`about.scripture.${index + 1}`] = value; });
  base.title.forEach((value, index) => { defaults[`about.heading.${index + 1}`] = value; });
  base.paragraphs.forEach((value, index) => { defaults[`about.paragraph.${index + 1}`] = value; });
  const messages = await getTranslations(locale, defaults);
  const text = { scripture: base.scripture.map((_, index) => messages[`about.scripture.${index + 1}`]), title: base.title.map((_, index) => messages[`about.heading.${index + 1}`]), paragraphs: base.paragraphs.map((_, index) => messages[`about.paragraph.${index + 1}`]), signer: messages["about.signer"] };
  return <div className="legacy-subpage"><LegacySubHero kind="about" locale={locale} tabs={[{ label: messages["about.tab.greeting"], href: `/${locale}/about`, active: true }, { label: messages["about.tab.history"], href: `/${locale}/about/history` }]} /><section className="legacy-greeting legacy-content-wrap"><div className="legacy-greeting-verse">{text.scripture.map((line) => <span key={line}>{line}</span>)}</div><div className="legacy-greeting-copy"><h2>{text.title.map((line) => <span key={line}>{line}</span>)}</h2>{text.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<strong>{text.signer}</strong></div></section></div>;
}
