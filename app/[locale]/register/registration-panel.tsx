import { getCurrentUser } from "@/lib/auth";
import { getTranslations } from "@/lib/i18n-server";
import { knownLocale } from "@/lib/i18n";
import { getLegalContent } from "@/lib/legal-content";
import { RegisterForm } from "./register-form";

export async function RegistrationPanel({ locale }: { locale: string }) {
  const english = knownLocale(locale) === "en";
  const legal = getLegalContent(knownLocale(locale));
  const user = await getCurrentUser();
  const messages = await getTranslations(locale, {
    "register.title":english ? "Register" : "회원가입", "register.description":english ? "You can sign in after an administrator approves your registration." : "가입 신청 후 관리자의 승인을 받으면 로그인할 수 있습니다.",
    "register.already_signed_in":english ? "You are already signed in." : "이미 로그인되어 있습니다.",
    "register.username":english ? "Username" : "아이디", "register.email":english ? "Email" : "이메일", "register.display_name":english ? "Name or display name" : "이름 또는 표시 이름",
    "register.password":english ? "Password" : "비밀번호", "register.password_help":english ? "Use at least 10 characters including letters and numbers." : "영문과 숫자를 포함하여 10자 이상 입력해 주세요.",
    "register.password_confirm":english ? "Confirm password" : "비밀번호 확인", "register.country":english ? "Country of residence (Optional)" : "거주 국가 (선택)",
    "register.gender":english ? "Gender (Optional)" : "성별 (선택)", "register.gender_none":english ? "Prefer not to say" : "선택하지 않음", "register.gender_male":english ? "Male" : "남성", "register.gender_female":english ? "Female" : "여성", "register.gender_other":english ? "Other" : "기타",
    "register.age":english ? "[Required] I am at least 14 years old" : "[필수] 만 14세 이상 확인", "register.terms":english ? "[Required] Agree to the Terms of Use" : "[필수] 이용약관 동의",
    "register.privacy":english ? "[Required] Agree to personal data collection and use" : "[필수] 개인정보 수집·이용 동의", "register.marketing":english ? "[Optional] Receive email updates" : "[선택] 이메일 안내 수신",
    "register.submit":english ? "Submit registration" : "가입 신청", "register.pending":english ? "Submitting…" : "처리 중…", "register.complete_title":english ? "Your registration has been submitted." : "가입 신청이 완료되었습니다.",
    "register.complete_description":english ? "You can sign in after administrator approval." : "관리자 승인 후 로그인할 수 있습니다.", "register.to_login":english ? "Go to sign in" : "로그인으로 이동",
  });

  return <section className="auth-panel registration-panel embedded-registration-panel" id="register"><h2>{messages["register.title"]}</h2><p className="muted">{user ? messages["register.already_signed_in"] : messages["register.description"]}</p>{user ? null : <RegisterForm locale={locale} legal={legal} labels={{ username:messages["register.username"],email:messages["register.email"],displayName:messages["register.display_name"],password:messages["register.password"],passwordHelp:messages["register.password_help"],passwordConfirm:messages["register.password_confirm"],country:messages["register.country"],gender:messages["register.gender"],genderNone:messages["register.gender_none"],genderMale:messages["register.gender_male"],genderFemale:messages["register.gender_female"],genderOther:messages["register.gender_other"],age:messages["register.age"],terms:messages["register.terms"],privacy:messages["register.privacy"],marketing:messages["register.marketing"],submit:messages["register.submit"],pending:messages["register.pending"],completeTitle:messages["register.complete_title"],completeDescription:messages["register.complete_description"],toLogin:messages["register.to_login"]}} />}</section>;
}
