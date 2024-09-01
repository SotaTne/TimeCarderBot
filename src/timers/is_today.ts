export function isToday(date: number, local?: "jp"): boolean {
  const now = new Date();
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date);
  const compareDateDate = new Date(
    compareDate.getFullYear(),
    compareDate.getMonth(),
    compareDate.getDate()
  );
  if (local === "jp") {
    compareDateDate.setHours(compareDateDate.getHours() + 9);
  }
  return nowDate.getTime() === compareDateDate.getTime();
}
