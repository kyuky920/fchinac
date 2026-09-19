/**
 * Public playlists from the official ABCMISSION Korea YouTube channel.
 * Video files remain on YouTube; the site keeps the legacy course/lesson flow.
 */

interface LectureMedia {
  playlistId: string;
  lessonNumbers: number[];
  availableLessonNumbers?: number[];
}

const lessons = (total: number, excluded: number[] = []) =>
  Array.from({ length: total }, (_, index) => index + 1).filter((lesson) => !excluded.includes(lesson));

export const lectureMediaByCourse: Record<string, LectureMedia> = {
  CH3002: { playlistId: "PL5K0l8RAAgIOBlh7h4tQrkeZ4aqgcoXUb", lessonNumbers: lessons(20), availableLessonNumbers: lessons(17) },
  MT3009: { playlistId: "PL5K0l8RAAgIN7LjepXJddW_qKmWc6IZQX", lessonNumbers: lessons(8) },
  MT3013: { playlistId: "PL5K0l8RAAgINOQ1_EDAccc45j1AvGJWjP", lessonNumbers: lessons(6) },
  MT3017: { playlistId: "PL5K0l8RAAgIOBO1rwNn29XS4avUOIXPUP", lessonNumbers: lessons(9) },
  NT2001: { playlistId: "PL5K0l8RAAgIMI3snY8yFc5mlIO5tr_T47", lessonNumbers: lessons(20) },
  NT2002: { playlistId: "PL5K0l8RAAgIORzUEbH7xy070cSVSVsQ20", lessonNumbers: lessons(20) },
  NT2003: { playlistId: "PL5K0l8RAAgIOJBgrywQjKi1-ozfXUtWvF", lessonNumbers: lessons(19) },
  NT2004: { playlistId: "PL5K0l8RAAgIOr0VmPVAxUeyt03QrQPc8W", lessonNumbers: lessons(20) },
  NT2005: { playlistId: "PL5K0l8RAAgIO8_p6aqP-HBG1o_8gk-FTu", lessonNumbers: lessons(16) },
  NT2006: { playlistId: "PL5K0l8RAAgIMyXxx5l1X4W8kdeCGaL9_A", lessonNumbers: lessons(22) },
  NT2007: { playlistId: "PL5K0l8RAAgIN411NAwVyOMS0zx46Vdi6q", lessonNumbers: lessons(6) },
  NT2008: { playlistId: "PL5K0l8RAAgINWst-bSuly6qo5hMxydYWW", lessonNumbers: lessons(18) },
  NT2009: { playlistId: "PL5K0l8RAAgIOJfcZRUacMebgpj01f3v6A", lessonNumbers: lessons(6) },
  NT2010: { playlistId: "PL5K0l8RAAgIMQeCo9gksCxmEvji5E8cN1", lessonNumbers: lessons(14) },
  NT2011: { playlistId: "PL5K0l8RAAgIOurXi49SG1UVbsPZT7LfMm", lessonNumbers: lessons(14) },
  NT2012: { playlistId: "PL5K0l8RAAgIO6OPFtxHB4aCeQBipEz1Yh", lessonNumbers: lessons(5) },
  NT2013: { playlistId: "PL5K0l8RAAgIPH3biYVOSb-lQAkloxtrbq", lessonNumbers: lessons(12) },
  NT2014: { playlistId: "PL5K0l8RAAgIOGoFKYiqiPbnI4Ea4UtUs8", lessonNumbers: lessons(9), availableLessonNumbers: lessons(6) },
  NT2015: { playlistId: "PL5K0l8RAAgIOCi-SJ2_m3PMcuE0eHfpRA", lessonNumbers: lessons(2) },
  NT2016: { playlistId: "PL5K0l8RAAgIO2KC_26o1nymn30uc5Ai1_", lessonNumbers: lessons(18) },
  NT3006: { playlistId: "PL5K0l8RAAgIPBchLRRumdGEx8xtnLm7sr", lessonNumbers: lessons(20) },
  NT3018: { playlistId: "PL5K0l8RAAgIPHlu8HnRvRRv-3N8T3FdL3", lessonNumbers: lessons(6) },
  NT4002: { playlistId: "PL5K0l8RAAgIOjYMEQqrl-LbTCcDDcnDYx", lessonNumbers: lessons(15) },
  OT1001: { playlistId: "PL5K0l8RAAgIObDE-sQC_Iq--GDdOcMVRn", lessonNumbers: lessons(20) },
  OT1002: { playlistId: "PL5K0l8RAAgIP0qGKm8hGb-zvNT3G8DuSg", lessonNumbers: lessons(20) },
  OT1003: { playlistId: "PL5K0l8RAAgIPGKpLuWJdjx8d8GIrpq6z7", lessonNumbers: lessons(14) },
  OT1005: { playlistId: "PL5K0l8RAAgINVPx4Sz7duvWsLvbtbVxM6", lessonNumbers: lessons(20) },
  OT1006: { playlistId: "PL5K0l8RAAgIOd5bdxU94f6DOPeBsy2yN-", lessonNumbers: lessons(20) },
  OT1008: { playlistId: "PL5K0l8RAAgINifUEeWT8Ru07kjYtTnv81", lessonNumbers: lessons(4) },
  OT1009: { playlistId: "PL5K0l8RAAgIMo-i26-0nU0h2DTlAj-opf", lessonNumbers: lessons(17) },
  OT1010: { playlistId: "PL5K0l8RAAgIP9FvN_VGuCk9f04lPcEDLQ", lessonNumbers: lessons(20) },
  OT1011: { playlistId: "PL5K0l8RAAgIPpW6riZfB0kS6-GlxHOug-", lessonNumbers: lessons(16) },
  OT1012: { playlistId: "PL5K0l8RAAgIMqQ5-oMQBKBNSiIUn4RhVr", lessonNumbers: lessons(15) },
  OT1014: { playlistId: "PL5K0l8RAAgIOQry1n4luP1LanNimypXHr", lessonNumbers: lessons(20) },
  OT1015: { playlistId: "PL5K0l8RAAgIPFupAWwjKUGNhJ3Z1tQeuF", lessonNumbers: lessons(16) },
  OT1016: { playlistId: "PL5K0l8RAAgIOTUTNhWx8ijE-7lEK-fHk0", lessonNumbers: lessons(20) },
  OT1017: { playlistId: "PL5K0l8RAAgIMpnO2nK0VQvRhJojUiqu_u", lessonNumbers: lessons(13) },
  OT1018: { playlistId: "PL5K0l8RAAgINSUIZBIqX8mqcXZI7jvtwx", lessonNumbers: lessons(18) },
  OT1019: { playlistId: "PL5K0l8RAAgIOvCdwBRDeKSkYCo3FAl6nN", lessonNumbers: lessons(11) },
  OT3003: { playlistId: "PL5K0l8RAAgIOhywazddNaZfSoG9RgveXp", lessonNumbers: lessons(15) },
  OT3005: { playlistId: "PL5K0l8RAAgINAUeK4lpYksFzIF-AbowEl", lessonNumbers: lessons(20, [2, 5, 7, 17]) },
  OT4001: { playlistId: "PL5K0l8RAAgIOpbjYBP85UfnlMOJ6OfZ8J", lessonNumbers: lessons(15) },
  PT3007: { playlistId: "PL5K0l8RAAgINyCBn0wPsLlBXcgeoSv1Hz", lessonNumbers: lessons(7) },
  PT3008: { playlistId: "PL5K0l8RAAgIMKI-peSA6aZUvSgtAANqLM", lessonNumbers: lessons(8) },
  PT3011: { playlistId: "PL5K0l8RAAgIMqc7-6GDQHwzobKB1yBlk_", lessonNumbers: lessons(14) },
  ST3001: { playlistId: "PL5K0l8RAAgIO7zypEqdb7d0ynqAbPZDj1", lessonNumbers: lessons(20) },
  ST3010: { playlistId: "PL5K0l8RAAgIM0LyoxcqoIVfta74Nczbbb", lessonNumbers: lessons(9) },
  ST3012: { playlistId: "PL5K0l8RAAgIN6Jkng651PzYxRwSGPSXfx", lessonNumbers: lessons(9, [3, 6, 8]) },
};
