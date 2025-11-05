import Swal from 'sweetalert2'

export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#3B82F6',
    confirmButtonText: 'OK',
    timer: 3000,
    timerProgressBar: true
  })
}

export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#EF4444',
    confirmButtonText: 'OK'
  })
}

export const showWarningAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#F59E0B',
    confirmButtonText: 'OK'
  })
}

export const showConfirmAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal'
  })
}

export const showLoginRequiredAlert = () => {
  return Swal.fire({
    icon: 'warning',
    title: 'Login Diperlukan',
    text: 'Silakan login terlebih dahulu untuk melakukan pembelian',
    showCancelButton: true,
    confirmButtonColor: '#3B82F6',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Login Sekarang',
    cancelButtonText: 'Batal'
  })
}

export const showLoadingAlert = (title: string = 'Loading...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  return Toast.fire({
    icon,
    title
  })
}

export const showLogoutConfirmation = () => {
  return Swal.fire({
    icon: 'question',
    title: 'Keluar dari Akun?',
    text: 'Apakah Anda yakin ingin keluar?',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      confirmButton: 'font-semibold px-6 py-2 rounded-lg',
      cancelButton: 'font-semibold px-6 py-2 rounded-lg'
    }
  })
}