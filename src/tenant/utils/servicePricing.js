const toPositiveNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

export const getEffectiveServicePrice = ({ service, variant }) => {
  return (
    toPositiveNumber(variant?.promoPrice) ??
    toPositiveNumber(service?.promoPrice) ??
    toPositiveNumber(variant?.price) ??
    toPositiveNumber(service?.price) ??
    0
  );
};
