import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DS160FormData {
  // Paso 1: Información Personal y Cita
  ciudadCita: 'TIJUANA' | 'NOGALES' | 'CIUDAD_JUAREZ' | 'NUEVO_LAREDO' | 'MONTERREY' | 'MATAMOROS' | 'GUADALAJARA' | 'HERMOSILLO' | 'CIUDAD_DE_MEXICO' | 'MERIDA' | ''
  citaCAS: 'TIJUANA' | 'NOGALES' | 'CIUDAD_JUAREZ' | 'NUEVO_LAREDO' | 'MONTERREY' | 'MATAMOROS' | 'GUADALAJARA' | 'HERMOSILLO' | 'CIUDAD_DE_MEXICO' | 'MERIDA' | ''
  nombreCompleto: string
  fechaNacimiento: string
  ciudadNacimiento: string
  estadoNacimiento: string
  paisNacimiento: string
  otraNacionalidad: 'SI' | 'NO' | ''
  especificarNacionalidad?: string

  // Paso 2: Pasaporte y Contacto
  numeroPasaporte: string
  fechaExpedicion: string
  fechaVencimiento: string
  ciudadExpedicion: string
  domicilio: string
  telefonoCasa?: string
  celular: string
  correoElectronico: string
  otrosNumeros: 'SI' | 'NO' | ''
  listaNumeros?: string
  correosAdicionales?: string
  redesSociales: string
  plataformasAdicionales: 'SI' | 'NO' | ''
  listaPlataformas?: string

  // Paso 3: Idiomas, Estado Civil y Patrocinador
  idiomas: string
  estadoCivil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'SEPARADO' | ''
  nombrePatrocinador?: string
  telefonoPatrocinador?: string
  domicilioPatrocinador?: string
  parentesco?: string

  // Paso 4: Viaje y Acompañantes
  fechaLlegada?: string
  duracionEstancia?: string
  hotel?: string
  telefonoHotel?: string
  familiarEnUSA?: string
  domicilioFamiliarUSA?: string
  telefonoFamiliarUSA?: string
  personasQueViajan?: string

  // Paso 5: Educación y Trabajo
  fechaInicioEstudios?: string
  fechaTerminoEstudios?: string
  nombreEscuela?: string
  gradoCarrera?: string
  domicilioEscuela?: string
  telefonoEscuela?: string
  ciudadEscuela?: string
  
  // Trabajo actual/último
  fechaInicioTrabajo?: string
  fechaFinTrabajo?: string
  nombreEmpresa?: string
  nombrePatron?: string
  domicilioEmpresa?: string
  telefonoEmpresa?: string
  puestoDesempenado?: string
  salarioMensual?: string

  // Paso 6: Información Familiar
  nombrePadre?: string
  fechaNacimientoPadre?: string
  nombreMadre?: string
  fechaNacimientoMadre?: string
  
  // Cónyuge (si está casado)
  nombreConyuge?: string
  fechaNacimientoConyuge?: string
  ciudadNacimientoConyuge?: string
  fechaMatrimonio?: string
  domicilioConyuge?: string
  
  // Si es viudo o divorciado
  numeroMatrimoniosAnteriores?: string
  nombreCompletoExConyuge?: string
  domicilioExConyuge?: string
  fechaNacimientoExConyuge?: string
  fechaMatrimonioAnterior?: string
  fechaDivorcio?: string
  terminosDivorcio?: string

  // Paso 7: Historial de Viajes y Visas
  ciudadExpedicionVisaAnterior?: string
  fechaExpedicionVisaAnterior?: string
  fechaVencimientoVisaAnterior?: string
  fechaUltimaEntradaUSA?: string
  duracionUltimaEstancia?: string
  haExtraviadoVisa: 'SI' | 'NO' | ''
  explicacionExtravioVisa?: string
  leHanNegadoVisa: 'SI' | 'NO' | ''
  explicacionNegacionVisa?: string
  haExtraviadoPasaporte: 'SI' | 'NO' | ''
  paisesVisitados?: string
  parientesInmediatosUSA?: string
}

interface DS160Store {
  formData: DS160FormData
  currentStep: number
  completedSteps: Set<number>
  
  // Actions
  updateFormData: (data: Partial<DS160FormData>) => void
  setCurrentStep: (step: number) => void
  markStepCompleted: (step: number) => void
  resetForm: () => void
  getTotalSteps: () => number
  getStepProgress: () => number
  isStepCompleted: (step: number) => boolean
}

const initialFormData: DS160FormData = {
  ciudadCita: '',
  citaCAS: '',
  nombreCompleto: '',
  fechaNacimiento: '',
  ciudadNacimiento: '',
  estadoNacimiento: '',
  paisNacimiento: '',
  otraNacionalidad: '',
  numeroPasaporte: '',
  fechaExpedicion: '',
  fechaVencimiento: '',
  ciudadExpedicion: '',
  domicilio: '',
  celular: '',
  correoElectronico: '',
  otrosNumeros: '',
  redesSociales: '',
  plataformasAdicionales: '',
  idiomas: '',
  estadoCivil: '',
  haExtraviadoVisa: '',
  leHanNegadoVisa: '',
  haExtraviadoPasaporte: '',
}

export const useDS160Store = create<DS160Store>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      currentStep: 1,
      completedSteps: new Set(),
      
      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data }
        })),
      
      setCurrentStep: (step) =>
        set({ currentStep: step }),
      
      markStepCompleted: (step) =>
        set((state) => {
          const newCompletedSteps = new Set(state.completedSteps)
          newCompletedSteps.add(step)
          return { completedSteps: newCompletedSteps }
        }),
      
      resetForm: () =>
        set({
          formData: initialFormData,
          currentStep: 1,
          completedSteps: new Set()
        }),
      
      getTotalSteps: () => 7,
      
      getStepProgress: () => {
        const { completedSteps } = get()
        const totalSteps = get().getTotalSteps()
        return (completedSteps.size / totalSteps) * 100
      },
      
      isStepCompleted: (step) => {
        const { completedSteps } = get()
        return completedSteps.has(step)
      }
    }),
    {
      name: 'ds160-form-storage',
      partialize: (state) => ({
        formData: state.formData,
        completedSteps: Array.from(state.completedSteps)
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.completedSteps)) {
          state.completedSteps = new Set(state.completedSteps)
        }
      }
    }
  )
)