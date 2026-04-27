export function mapApiError(error) {
  if (error?.message) {
    return error.message;
  }

  return 'Ocurrio un error inesperado. Intenta nuevamente.';
}
