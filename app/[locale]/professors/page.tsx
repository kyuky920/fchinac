import { notFound } from "next/navigation";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero } from "@/app/[locale]/_components/legacy-subpage";
import { legacyProfessors } from "@/lib/legacy-content";

export default async function ProfessorsPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!(await isActiveLocale(locale))) notFound(); const defaults:Record<string,string>={}; legacyProfessors.forEach(([name,biography],index)=>{defaults[`professors.${index+1}.name`]=name;defaults[`professors.${index+1}.biography`]=biography}); const messages=await getTranslations(locale,defaults); return <div className="legacy-subpage"><LegacySubHero kind="professors" locale={locale} /><section className="legacy-professor-list legacy-content-wrap">{legacyProfessors.map((_,index) => {const name=messages[`professors.${index+1}.name`];const biography=messages[`professors.${index+1}.biography`];return <article key={index}><h2>{name}</h2><p>{biography.split("|").map((line,lineIndex) => <span key={lineIndex}>{line}</span>)}</p></article>})}</section></div>; }
