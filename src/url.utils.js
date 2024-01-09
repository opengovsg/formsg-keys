const formIdRegex = new RegExp(
  /form\.gov\.sg\/admin\/form\/(?<formid>[0-9a-fA-F]{24})\/*.*/
);
export const getFormIdFromAdminUrl = (url) => {
  const result = formIdRegex.exec(url);
  if (!result) {
    return null;
  }
  return result[1];
};
