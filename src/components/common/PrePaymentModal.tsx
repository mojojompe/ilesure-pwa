import React from 'react';
import { PaymentSafetyModal } from './PaymentSafetyModal';

interface PrePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

export const PrePaymentModal: React.FC<PrePaymentModalProps> = ({
  visible,
  onClose,
  onConfirm,
  amount,
  loading = false,
}) => {
  return (
    <PaymentSafetyModal
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      amount={amount}
      loading={loading}
    />
  );
};

export default PrePaymentModal;

