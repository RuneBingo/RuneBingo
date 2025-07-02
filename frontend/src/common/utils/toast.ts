import { type ExternalToast, toast as sonnerToast } from 'sonner';

const MESSAGE_OPTIONS = {
  richColors: true,
  dismissible: true,
  position: 'bottom-center',
} as const satisfies ExternalToast;

const sendErrorMessage = (message: string, options?: ExternalToast) => {
  sonnerToast.error(message, { ...MESSAGE_OPTIONS, ...options });
};

const sendInfoMessage = (message: string, options?: ExternalToast) => {
  sonnerToast.info(message, { ...MESSAGE_OPTIONS, ...options });
};

const sendSuccessMessage = (message: string, options?: ExternalToast) => {
  sonnerToast.success(message, { ...MESSAGE_OPTIONS, ...options });
};

const sendWarningMessage = (message: string, options?: ExternalToast) => {
  sonnerToast.warning(message, { ...MESSAGE_OPTIONS, ...options });
};

const toast = {
  error: sendErrorMessage,
  info: sendInfoMessage,
  success: sendSuccessMessage,
  warning: sendWarningMessage,
};

export default toast;
