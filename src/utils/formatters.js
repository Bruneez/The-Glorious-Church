export function formatCurrency(amount, currency = 'ZAR') {
  const numAmount = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
}

export function formatCurrencySimple(amount) {
  const numAmount = parseFloat(amount) || 0;
  return 'R' + numAmount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatDate(dateString, format = 'long') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    time: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit' }
  };

  return date.toLocaleDateString('en-ZA', options[format] || options.long);
}

export function formatTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function formatWhatsAppLink(phone) {
  if (!phone) return '#';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `https://wa.me/27${cleaned.slice(1)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `https://wa.me/27${cleaned.slice(1)}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('27')) {
    return `https://wa.me/${cleaned}`;
  }
  
  return '#';
}

export function formatPercentage(value, decimals = 1) {
  const numValue = parseFloat(value) || 0;
  return `${numValue.toFixed(decimals)}%`;
}

export function formatNumber(num) {
  return new Intl.NumberFormat('en-ZA').format(num);
}

export function formatAge(dateOfBirth) {
  if (!dateOfBirth) return '';
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) return '';
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function capitalizeWords(str) {
  if (!str) return '';
  return str.split(' ').map(word => capitalizeFirst(word)).join(' ');
}

export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString, 'short');
}
