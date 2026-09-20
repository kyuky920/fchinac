import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, knownLocale } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { legacyContact, legacyFamilySites, membershipNoticeCopy } from "@/lib/legacy-content";
import { getCurrentUser } from "@/lib/auth";
import { shouldShowGuestActions } from "@/lib/home-access";

const homeCopy = {
  ko: {
    verses: [["그러므로 너희는 가서 모든 민족을 제자로 삼아 아버지와 아들과 성령의 이름으로 세례를 베풀고 내가 너희에게 분부한 모든 것을 가르쳐 지키게 하라. 볼지어다. 내가 세상 끝날까지 너희와 항상 함께 있으리라 하시니라.", "마태복음 28:19-20"], ["오직 성령이 너희에게 임하시면 너희가 권능을 받고 예루살렘과 온 유대와 사마리아와 땅 끝까지 이르러 내 증인이 되리라 하시니라", "사도행전 1:8"], ["예수께서 이르시되 내가 곧 길이요 진리요 생명이니 나로 말미암지 않고는 아버지께로 올 자가 없느니라", "요한복음 14:6"]],
    about: ["누구든지 영상으로 신학(성경)을 공부 할 수 있습니다. 회비와 학비가 무료입니다.", "목회자는 신학공부를 할 수 있고, 평신도는 성경공부를 할 수 있습니다.", "누구든지 서적과 자료를 내려 받을 수 있습니다.", "수시로 선교회 회원으로 등록할 수 있고, 아무 때나 영상으로 공부할 수 있습니다.", "미국 Puritan Reformed University와 상호 교류하기로 협정을 맺었습니다."],
    vision: ["전 세계를 향하여 복음에 헌신하는 목회자, 선교사를 양성합니다.", "바른 신학교육으로 유능한 목회자를 양성합니다.", "성경에 능통하여 설교를 잘하는 목회자를 양성합니다.", "기도를 많이 하여 성령과 능력이 충만한 목회자를 양성합니다.", "예수님을 많이 닮아가는 경건한 목회자를 양성합니다."],
    route: ["우리는 개혁주의, 칼빈주의, 보수주의의 노선을 지향합니다.", "우리는 성경은 무오한 하나님의 말씀으로 우리 신앙과 행위의 유일한 표준으로 믿습니다.", "우리는 성경의 축자영감과 유기적영감을 믿습니다.", "우리는 웨스트민스터 신앙고백서와 대소요리문답이 성경의 가르침에 가장 충실한 것으로 믿습니다."],
    notice: "공지사항", lecture: "강의영상1", family: "관련사이트", check: "꼭 확인하세요!",
  },
  en: {
    verses: [["Go into all the world and preach the gospel to all creation.", "Mark 16:15"], ["Then you will know the truth, and the truth will set you free.", "John 8:32"], ["You will receive power when the Holy Spirit comes on you.", "Acts 1:8"]],
    about: ["Open learning for everyone", "Systematic, Bible-centered study", "Online lectures available worldwide", "Learning anytime and anywhere", "Concluded agreement with the U.S. Puritan Reformed University."],
    vision: ["Build Bible-centered faith and theology.", "Share the gospel and education online.", "Train workers for world mission.", "Serve churches and mission fields.", "Work together across languages and regions."],
    route: ["We believe the Bible is the inspired Word of God.", "We proclaim salvation through Jesus Christ.", "We pursue sound evangelical faith and theology.", "We serve the church and world mission."],
    notice: "Notice", lecture: "Video Lectures", family: "Family Sites", check: "Membership information",
  },
  "zh-CN": {
    verses: [["所以，你们要去，使万民作我的门徒，奉父、子、圣灵的名给他们施洗.。凡我所吩咐你们的，都教训他们遵守，我就常与你们同在，直到世界的末了。", "马太福音 28:19-20"], ["但 圣 灵 降 临 在 你 们 身 上 ， 你 们 就 必 得 着 能 力 ， 并 要 在 耶 路 撒 冷 、 犹 太 全 地 ， 和 撒 玛 利 亚 ， 直 到 地 极 ， 作 我 的 见 证 。", "使徒行传 1:8"], ["耶稣说：“我就是道路、真理、生命；若不藉着我，没有人能到父那里去。", "约翰福音14：6"]],
    about: ["任何人都可以利用视频学习神学(圣经)(免会费,免学费)", "牧会者可以学习神学", "任何人都可以下载书籍和资料。", "随时可以注册为宣教会会员,随时可以通过视频学习", "与美国 Puritan Reformed University 签订了合作协议。"],
    vision: ["面向全世界培养献身福音的牧会者，宣教士。", "通过正确的神学教育，培养有能力的牧会者 。", "培养精通圣经，讲出好道的牧会者.", "培养多祈祷，被圣灵充满且大有能力的牧会者. ", "培养像耶稣一样敬虔的牧会者."],
    route: ["追求改革主义，加尔文主义，正统保守主义的路线.。", "相信圣经是无误的上帝之道，是我们信仰与行为的唯一准则.。", "相信圣经的逐字灵感与有机灵感.", "相信<威斯特敏斯特信仰告白>》与《<威斯特敏斯特大小要理问答>》是最忠于圣经教导."],
    notice: "公告事项", lecture: "教学影像", family: "家庭网站", check: "请务必确认!",
  },
  mn: {
    verses: [["Бүх дэлхийгээр явж, сайн мэдээг тунхаглагтун.", "Марк 16:15"], ["Та нар үнэнийг мэдэж, үнэн та нарыг чөлөөлнө.", "Иохан 8:32"], ["Ариун Сүнс та нар дээр ирэхэд хүчийг авна.", "Үйлс 1:8"]],
    about: ["Хүн бүрд нээлттэй сургалт", "Библид төвлөрсөн системтэй судалгаа", "Дэлхийн хаанаас ч оролцох цахим хичээл", "Хэзээ ч, хаана ч суралцах", "АНУ-ын Puritan Reformed University-тай хамтын ажиллагааны гэрээ байгуулсан."],
    vision: ["Библид төвлөрсөн итгэл ба теологийг бэхжүүлнэ.", "Сайн мэдээ ба сургалтыг цахимаар түгээнэ.", "Дэлхийн номлолын ажилтнуудыг бэлтгэнэ.", "Чуулган ба номлолын талбарт үйлчилнэ.", "Хэл, бүс нутгийг даван хамтарна."],
    route: ["Библи бол Бурханы сүнслэгээр өгсөн Үг гэдэгт итгэдэг.", "Есүс Христээр дамжих авралыг тунхагладаг.", "Эрүүл евангелийн итгэл ба теологийг баримталдаг.", "Чуулган ба дэлхийн номлолд үйлчилдэг."],
    notice: "Мэдэгдэл", lecture: "Видео хичээл", family: "Холбоотой сайтууд", check: "Гишүүнчлэлийн мэдээлэл",
  },
  es: {
    verses: [["Id por todo el mundo y predicad el evangelio.", "Marcos 16:15"], ["Conoceréis la verdad, y la verdad os hará libres.", "Juan 8:32"], ["Recibiréis poder cuando haya venido sobre vosotros el Espíritu Santo.", "Hechos 1:8"]],
    about: ["Educación abierta para todos", "Estudio sistemático centrado en la Biblia", "Clases en línea desde cualquier lugar", "Aprendizaje en cualquier momento", "Se celebró un acuerdo de colaboración con Puritan Reformed University de los Estados Unidos."],
    vision: ["Formamos una fe y teología bíblicas.", "Compartimos el evangelio y la educación en línea.", "Preparamos obreros para la misión mundial.", "Servimos a iglesias y campos misioneros.", "Colaboramos más allá de idiomas y regiones."],
    route: ["Creemos que la Biblia es la Palabra inspirada de Dios.", "Proclamamos la salvación por Jesucristo.", "Buscamos una fe y teología evangélicas sanas.", "Servimos a la iglesia y la misión mundial."],
    notice: "Avisos", lecture: "Videoclases", family: "Sitios relacionados", check: "Información de membresía",
  },
} as const;

const featureNames = ["ANYONE", "STUDY", "OPEN", "ANYTIME", "AGREEMENT"];
const professors = ["Dr. Hyo Cheon Jo", "Dr. Back June Chang", "Dr. Eoun Ki Rah", "Dr. Dong Sak Gwak", "Dr. Sung Ho Nam"];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!(await isActiveLocale(rawLocale))) notFound();
  const locale = rawLocale;
  const base = homeCopy[knownLocale(locale)];
  const contentLocale = knownLocale(locale);
  const dictionary = getDictionary(locale);
  const user = await getCurrentUser();
  const contact = legacyContact[contentLocale === "zh-CN" ? "zh-CN" : contentLocale === "ko" ? "ko" : "en"];
  const notices = membershipNoticeCopy[contentLocale === "zh-CN" ? "zh-CN" : contentLocale === "ko" ? "ko" : "en"];
  const defaults: Record<string, string> = {
    "home.notice": base.notice, "home.lecture": base.lecture, "home.family": base.family, "home.check": base.check,
    "common.register": dictionary.register, "common.login": dictionary.login,
    "common.address": contact.address,
  };
  base.verses.forEach(([verse, citation], index) => { defaults[`home.verse.${index + 1}.text`] = verse; defaults[`home.verse.${index + 1}.citation`] = citation; });
  base.about.forEach((text, index) => { defaults[`home.about.${index + 1}`] = text; });
  base.vision.forEach((text, index) => { defaults[`home.vision.${index + 1}`] = text; });
  base.route.forEach((text, index) => { defaults[`home.route.${index + 1}`] = text; });
  notices.forEach((notice, index) => { defaults[`membership.notice.${index + 1}`] = notice; });
  const messages = await getTranslations(locale, defaults);
  const copy = {
    verses: base.verses.map((_, index) => [messages[`home.verse.${index + 1}.text`], messages[`home.verse.${index + 1}.citation`]] as const),
    about: base.about.map((_, index) => messages[`home.about.${index + 1}`]),
    vision: base.vision.map((_, index) => messages[`home.vision.${index + 1}`]),
    route: base.route.map((_, index) => messages[`home.route.${index + 1}`]),
    notices: notices.map((_, index) => messages[`membership.notice.${index + 1}`]),
    register: messages["common.register"], login: messages["common.login"],
    notice: messages["home.notice"], lecture: messages["home.lecture"], family: messages["home.family"], check: messages["home.check"],
  };

  return (
    <div className="legacy-home">
      <section className="legacy-slider" aria-label="Bible verses">
        {copy.verses.map(([verse, citation], index) => (
          <article className={`legacy-slide legacy-slide-${index + 1}`} key={citation}>
            <h1><span>Antioch Bible Cyber</span><span>Mission &amp; Theological Seminary</span></h1>
            <p>{verse}</p><small>{citation}</small>
          </article>
        ))}
      </section>

      <section className="legacy-about legacy-section" id="about">
        <h2>ABOUT US</h2>
        <div className="feature-row">
          {copy.about.map((text, index) => (
            <article className="feature-item" key={featureNames[index]}>
              <div className="feature-image" style={{ backgroundImage: `url(/legacy/images/awesome_0${index + 1}.png)` }}><strong>{featureNames[index]}</strong></div>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="legacy-home-notice">
        <div className="legacy-section">
          <p className="legacy-home-notice-label">{copy.notice}</p>
          <h2>{copy.check}</h2>
          <div className="legacy-notices">{copy.notices.map((notice, index) => {
            const prefix = contentLocale === "ko" ? "만일 회원이 " : contentLocale === "zh-CN" ? "如发现会员" : "Members who ";
            const isAlert = index === 4;
            const hasPrefix = isAlert && notice.startsWith(prefix);
            return <article key={index}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{isAlert ? <>{hasPrefix ? prefix : null}<span className="legacy-notice-alert">{hasPrefix ? notice.slice(prefix.length) : notice}</span></> : notice}</p></article>;
          })}</div>
          {shouldShowGuestActions(user) ? <div className="legacy-home-auth-actions">
            <Link className="legacy-join-button" href={`/${locale}/membership#register`}>{copy.register}</Link>
            <Link className="legacy-login-button" href={`/${locale}/login`}>{copy.login}</Link>
          </div> : null}
        </div>
      </section>

      <section className="legacy-vision" id="membership">
        <h2>OUR VISION</h2>
        <div className="vision-row">
          {copy.vision.map((text, index) => (
            <article className="vision-item" key={text}>
              <Image src={`/legacy/images/mp_icon_0${index + 1}.png`} alt="" width={140} height={140} /><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="legacy-route legacy-section">
        <h2>WE ARE</h2>
        <div className="route-list">{copy.route.map((text, index) => <p key={text}><strong>0{index + 1}</strong><span>{text}</span></p>)}</div>
      </section>

      <section className="legacy-professors" id="professors">
        <h2>PROFESSOR</h2>
        <div className="professor-row">
          {professors.map((name, index) => <article key={name}><Image src={`/legacy/images/professor_0${index + 1}.png`} alt={name} width={150} height={150} /><p>{name}</p></article>)}
        </div>
      </section>

      <section className="legacy-bottom legacy-section">
        <article><h3>Contact Us</h3><div className="contact-list"><p><strong>TEL.</strong> +82-2-402-4169</p><p><strong>TEL.</strong> +82-10-6441-7522</p><p><strong>Email.</strong> ihsihope@gmail.com</p><p><strong>Email.</strong> true323@naver.com</p><p><strong>Address.</strong> {messages["common.address"]}</p></div></article>
        <article><h3>{copy.family}</h3><div className="family-sites">{legacyFamilySites.map((site) => <Link href={site.href} key={site.href} target="_blank" rel="noreferrer" aria-label={site.label}><Image src={site.image} alt={site.label} width={492} height={295} /></Link>)}</div></article>
      </section>
    </div>
  );
}
