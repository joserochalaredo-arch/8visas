import { redirect } from 'next/navigation'

// Esta ruta ya no se utiliza. Redirigimos de inmediato al Paso 1 del formulario.
export default function ClientInfoRedirect() {
  redirect('/form/step-1')
}