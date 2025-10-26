import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Proteger rutas del formulario
  if (request.nextUrl.pathname.startsWith('/form')) {
    // Verificar si hay un token válido en la URL
    const token = request.nextUrl.searchParams.get('token')
    
    if (token) {
      // Si hay token, permitir acceso directo al formulario DS-160
      // El componente del formulario se encargará de validar el token
      return NextResponse.next()
    }
    
    // Si no hay token, verificar la cookie de formulario normal
    const formCookie = request.cookies.get('form-storage')
    
    if (!formCookie) {
      return NextResponse.redirect(new URL('/client-info', request.url))
    }

    try {
      const formData = JSON.parse(formCookie.value)
      const clientInfo = formData.state?.clientInfo
      const isInitialized = formData.state?.isFormInitialized
      
      // Verificar que hay información del cliente y el formulario está inicializado
      if (!clientInfo || !isInitialized) {
        return NextResponse.redirect(new URL('/client-info', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/client-info', request.url))
    }
  }

  // Proteger rutas de admin (temporalmente deshabilitado para debug)
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin') {
    // Permitir acceso temporal para debug
    console.log('Acceso admin permitido para debug:', request.nextUrl.pathname)
    
    // Comentado temporalmente para permitir debug
    /*
    const adminCookie = request.cookies.get('admin-storage')
    
    if (!adminCookie) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    try {
      const adminData = JSON.parse(adminCookie.value)
      const isAdminAuthenticated = adminData.state?.isAdminAuthenticated
      
      if (!isAdminAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    */
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/form/:path*', '/admin/dashboard/:path*', '/admin/client/:path*']
}