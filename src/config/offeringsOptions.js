import { formatDate, formatCurrencySimple } from '@/utils/formatters';

export function getOfferingTotalAmount(offering) {
  const value = offering?.totalAmount ?? offering?.amount ?? 0;
  return Number(value) || 0;
}

export function buildOfferingPayload(formData, recordedBy) {
  const totalAmount = parseFloat(formData.totalAmount);

  return {
    serviceDate: formData.serviceDate,
    date: formData.serviceDate,
    totalAmount,
    amount: totalAmount,
    recordedBy,
  };
}

export function computeOfferingStats(offerings = []) {
  if (!offerings.length) {
    return { total: 0, average: 0 };
  }

  const amounts = offerings.map(getOfferingTotalAmount);
  const total = amounts.reduce((sum, value) => sum + value, 0);
  const average = total / offerings.length;

  return { total, average };
}

export function mapOfferingForTable(offering) {
  return {
    id: offering.id,
    serviceDate: offering.serviceDate || offering.date || '',
    totalAmount: getOfferingTotalAmount(offering),
    recordedBy: offering.recordedBy || '-',
    createdAt: offering.createdAt || offering.updatedAt || '',
  };
}

export function validateOfferingForm(formData) {
  if (!formData.serviceDate?.trim()) {
    return 'Date of Service is required.';
  }

  if (formData.totalAmount === '' || formData.totalAmount === null || formData.totalAmount === undefined) {
    return 'Total Amount is required.';
  }

  const totalAmount = parseFloat(formData.totalAmount);
  if (Number.isNaN(totalAmount) || totalAmount < 0) {
    return 'Total Amount must be a valid number greater than or equal to 0.';
  }

  return '';
}

export function filterOfferings(offerings = [], searchTerm) {
  if (!searchTerm?.trim()) return offerings;

  const term = searchTerm.toLowerCase().trim();

  return offerings.filter((offering) => {
    const serviceDate = offering.serviceDate || '';
    const formattedDate = serviceDate ? formatDate(serviceDate).toLowerCase() : '';
    const amountText = String(offering.totalAmount ?? '');
    const formattedAmount = formatCurrencySimple(offering.totalAmount).toLowerCase();
    const recordedBy = (offering.recordedBy || '').toLowerCase();

    return (
      serviceDate.toLowerCase().includes(term) ||
      formattedDate.includes(term) ||
      amountText.includes(term) ||
      formattedAmount.includes(term) ||
      recordedBy.includes(term)
    );
  });
}
