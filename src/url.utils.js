const formIdRegex = new RegExp(
  /form\.gov\.sg\/admin\/form\/(?<formid>[0-9a-fA-F]{24})\/*.*/
);
export const getFormIdFromAdminUrl = (url) => {
  return formIdRegex.exec(url)[1];
};
