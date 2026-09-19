const keys = [
  "menu.about", "menu.professors", "menu.membership", "menu.lectures", "menu.resources",
  "common.site_name", "common.login", "common.logout", "common.admin", "common.register", "common.address", "common.footer_disclaimer",
  "legal.terms", "legal.privacy",
  "home.notice", "home.lecture", "home.family", "home.check",
  "page.about.title", "page.professors.title", "page.membership.title", "page.lectures.title", "page.resources.title",
  "resources.book_old", "resources.book_faith2", "resources.book_faith", "resources.book_data", "resources.korean_reference",
  "resources.download", "resources.login_to_download",
  "about.tab.greeting", "about.tab.history", "about.signer",
  "membership.tab.notice", "membership.tab.register", "membership.heading",
  "history.title", "history.church_title", "history.current",
  "lectures.notice", "lectures.round", "lectures.lesson", "lectures.watch", "lectures.back", "lectures.unavailable",
  "login.title", "login.description", "login.identifier", "login.password", "login.submit", "login.pending",
  "login.register", "register.title", "register.description", "register.username", "register.email", "register.display_name",
  "register.password", "register.password_help", "register.password_confirm", "register.country", "register.gender", "register.gender_none", "register.gender_male", "register.gender_female", "register.gender_other", "register.age", "register.terms", "register.privacy",
  "register.marketing", "register.submit", "register.pending", "register.complete_title", "register.complete_description", "register.to_login",
  "boards.title", "boards.notice_badge", "boards.empty", "boards.previous", "boards.next",
  "post.views", "post.attachments",
];

for (let index = 1; index <= 3; index += 1) keys.push(`home.verse.${index}.text`, `home.verse.${index}.citation`);
for (let index = 1; index <= 5; index += 1) keys.push(`home.about.${index}`, `home.vision.${index}`);
for (let index = 1; index <= 4; index += 1) keys.push(`home.route.${index}`, `about.paragraph.${index}`);
for (let index = 1; index <= 5; index += 1) keys.push(`about.scripture.${index}`);
for (let index = 1; index <= 3; index += 1) keys.push(`about.heading.${index}`);
for (let index = 1; index <= 15; index += 1) keys.push(`history.event.${index}`);
for (let index = 1; index <= 6; index += 1) keys.push(`history.church_event.${index}`);
for (let index = 1; index <= 5; index += 1) keys.push(`membership.notice.${index}`);
for (let index = 1; index <= 21; index += 1) keys.push(`professors.${index}.name`, `professors.${index}.biography`);

const courseCounts = { "old-testament": 19, "new-testament": 19, history: 1, systematic: 3, practical: 4, mission: 2 } as const;
for (const [category, count] of Object.entries(courseCounts)) {
  keys.push(`lectures.category.${category}`);
  for (let index = 1; index <= count; index += 1) keys.push(`lectures.course.${category}.${index}`);
}

export const translationCatalogKeys = [...new Set(keys)].sort();
