USE fchinac_dev;
SET NAMES utf8mb4;

INSERT INTO site_translations (locale_code, message_key, value)
VALUES
  ('ko', 'home.about.5', '미국 Puritan Reformed University와 상호 교류하기로 협정을 맺었습니다.'),
  ('en', 'home.about.5', 'Concluded agreement with the U.S. Puritan Reformed University.'),
  ('zh-CN', 'home.about.5', '与美国 Puritan Reformed University 签订了合作协议。'),
  ('mn', 'home.about.5', 'АНУ-ын Puritan Reformed University-тай хамтын ажиллагааны гэрээ байгуулсан.'),
  ('es', 'home.about.5', 'Se celebró un acuerdo de colaboración con Puritan Reformed University de los Estados Unidos.'),
  ('ko', 'membership.notice.1', '로그인하고 공부하시오.'),
  ('ko', 'membership.notice.2', '본 선교회의 강의 동영상을 외장하드(메모리)에 저장하여 보급하고 있으며, 그 동영상을 현지에서 모니터로 회원들에게 신학(성경)공부를 시킬 수 있습니다.'),
  ('ko', 'membership.notice.3', '당신이 사용하는 언어가 우리 강의에서 번역이 안되어 있는 경우에는, 우리의 영어로 된 강의 동영상을 AI자막 또는 번역 앱 또는 더빙 앱을 사용하여 번역하십시오. 또는 "강의록"에 들어가서 영어로된 "강의 워드 파일"을 번역하여 사용하시오.'),
  ('ko', 'membership.notice.4', '공부를 마친 자에게는 수료증을 수여합니다. 그리고 학위 또는 졸업장을 받으시려면 본 선교회로 연락하시면 자세한 안내를 받으실 수 있습니다.'),
  ('ko', 'membership.notice.5', '만일 회원이 비성서적인 주장을 하거나 이단과 사이비한 사상을 주장하면 공부했던 모든 근거를 지우고, 제명 처리합니다.'),
  ('en', 'membership.notice.1', 'Sign in before studying.'),
  ('en', 'membership.notice.2', 'The mission distributes lecture videos on external drives or memory devices so members can study theology and the Bible locally using a monitor.'),
  ('en', 'membership.notice.3', 'If your language is not available in our lectures, translate our English lecture videos using AI captions, a translation app, or a dubbing app. Alternatively, open "Lecture Notes" and translate the English "lecture Word file" for use.'),
  ('en', 'membership.notice.4', 'A certificate of completion is awarded to those who finish their studies. Contact the mission for information about degrees or diplomas.'),
  ('en', 'membership.notice.5', 'Members who advocate unbiblical, cultic, or heretical teachings will have their study records removed and their membership terminated.'),
  ('zh-CN', 'membership.notice.1', '请登录后学习。'),
  ('zh-CN', 'membership.notice.2', '提供外置硬盘（存储器）: 可将本宣教会的讲课视频存储在外置硬盘（存储器）中进行推广. 在当地可用显示器让会员们学习神学（圣经）.'),
  ('zh-CN', 'membership.notice.3', '如果我们的课程没有提供您所使用语言的翻译，请使用 AI 字幕、翻译应用程序或配音应用程序翻译我们的英语讲课视频。或者进入“讲义”，翻译并使用英语“讲课 Word 文件”。'),
  ('zh-CN', 'membership.notice.4', '对学习完成者颁发结业证书. 如果想要拿学位或毕业证，请联系本宣教会获取详细介绍.'),
  ('zh-CN', 'membership.notice.5', '如发现会员主张非圣书性的或异端邪说思想，则进行除名处理. 另外，学习结束后，如果发现提出非圣书性的主张或异端邪说思想，则删除所学过的所有根据，并进行除名处理.')
ON DUPLICATE KEY UPDATE value=VALUES(value);

DELETE FROM site_translations
WHERE message_key IN ('membership.notice.6', 'membership.notice.7', 'membership.notice.8');
