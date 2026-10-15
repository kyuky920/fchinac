// Transcribed from the Korean, Chinese, and English YouTube HWP lists received
// on 2026-10-15. `ABCMISSIOIN` is intentionally preserved from those lists.
const englishCourseTerms: Record<string, string> = {
  OT4001: "Hebrew",
  OT3003: "Biblical Theology",
  OT3005: "Introduction to the Old Testament",
  OT1001: "Genesis",
  OT1002: "Exodus",
  OT1003: "Leviticus",
  OT1005: "Deuteronomy",
  OT1006: "Joshua",
  OT1008: "Ruth",
  OT1009: "1,2 Samuel",
  OT1010: "1,2 Kings",
  OT1011: "Ezra, Nehemiah",
  OT1012: "Psalms",
  OT1014: "Ecclesiastes, The Song of Solomon",
  OT1015: "Isaiah",
  OT1016: "Jeremiah",
  OT1017: "Daniel",
  OT1018: "Minor ProphetsⅠ",
  OT1019: "Minor ProphetsⅡ",
  NT4002: "New Testament Greek",
  NT3006: "Introduction to the New Testament",
  NT3018: "Hermeneutics",
  NT2001: "Matthew",
  NT2002: "Luke",
  NT2003: "John",
  NT2004: "Acts",
  NT2005: "Romans",
  NT2006: "1,2 Corinthians",
  NT2007: "Galatians",
  NT2008: "The Prison Epistles",
  NT2009: "1,2 Thessalonians",
  NT2010: "1,2 Timothy",
  NT2011: "Hebrews",
  NT2012: "James",
  NT2013: "1,2 Peter",
  NT2014: "1,2,3 John",
  NT2015: "Jude",
  NT2016: "Revelation",
  CH3002: "Church History",
  ST3001: "Systematic Theology",
  ST3010: "Christian Ethics",
  ST3012: "Contemporary Theology Criticism",
  PT3007: "Church Order",
  PT3008: "Pastoral Theology",
  PT3011: "Homiletics",
  MT3009: "Comparative Religion",
  MT3013: "Evangelism",
  MT3017: "Theology of Mission",
};

export const youtubeCourseCodes = Object.freeze(Object.keys(englishCourseTerms));

export function getCourseYoutubeUrl(input: {
  locale: string;
  courseCode: string;
  playlistId: string | null;
}) {
  if ((input.locale === "ko" || input.locale === "zh-CN") && input.playlistId) {
    return `https://www.youtube.com/playlist?list=${encodeURIComponent(input.playlistId)}`;
  }

  const term = englishCourseTerms[input.courseCode];
  const query = term
    ? `ABCMISSIOIN - English - ${term}`
    : `ABCMISSIOIN - English - ${input.courseCode}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
