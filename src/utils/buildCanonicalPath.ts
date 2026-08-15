export const buildCanonicalPath = ({
  id, title,
  country,
  city,
  category,
  region,
}: {
  id: string;
  title: string;
  country?: string | null;
  category?: { categoryHandle: string } | null;
  city?: { cityHandle: string } | null;
  region?: { regionHandle: string } | null;
}) => {
  const locationHandle = region?.regionHandle ?? city?.cityHandle;

  if (!locationHandle) {
    throw new Error("Activity must have either a city or a region");
  }

  return [
    country ? country : "/nepal",
    locationHandle,
    category?.categoryHandle,
    (title.replace(/\s+/g, "-") + "-" + id).toLowerCase(),
  ].join("/");
};
