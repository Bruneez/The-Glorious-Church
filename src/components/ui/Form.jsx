import { useState } from 'react';

export default function Form({ children, onSubmit, className = '' }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {typeof children === 'function' ? children({ isSubmitting }) : children}
    </form>
  );
}
