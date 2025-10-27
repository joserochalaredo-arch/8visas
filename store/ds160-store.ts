import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DS160FormData {
  // Paso 1: Información Personal
  nombreCompleto: string
  fechaNacimiento: string
  ciudadEstadoPaisNacimiento: string
  otraNacionalidad: 'SI' | 'NO' | ''
  especificarNacionalidad?: string
  consuladoDeseado: string
  oficinaCAS: string
  
  // Campos anteriores para compatibilidad (se pueden remover después)
  ciudadNacimiento?: string
  estadoNacimiento?: string
  paisNacimiento?: string
  citaCAS?: 'GDL' | 'MTY' | 'MEX' | 'TIJ' | 'JUA' | 'NOG' | 'NLD' | 'MAT' | 'HER' | 'MER' | 'OTRO' | ''

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
  idiomas: string
  estadoCivil: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'SEPARADO' | ''
  
  // Nuevos campos del Paso 2
  nombreQuienPaga?: string
  personasQueViajan?: string
  
  // Campos anteriores para compatibilidad
  ciudadCita?: 'GDL' | 'MTY' | 'MEX' | 'TIJ' | 'JUA' | 'NOG' | 'NLD' | 'MAT' | 'HER' | 'MER' | 'OTRO' | ''

  // Paso 4: Viaje y Acompañantes
  nombrePatrocinador?: string
  telefonoPatrocinador?: string
  domicilioPatrocinador?: string
  parentesco?: string
  fechaLlegada?: string
  duracionEstancia?: string
  hotel?: string
  telefonoHotel?: string
  familiarEnUSA?: string
  domicilioFamiliarUSA?: string
  telefonoFamiliarUSA?: string

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
  // Paso 1
  nombreCompleto: '',
  fechaNacimiento: '',
  ciudadEstadoPaisNacimiento: '',
  otraNacionalidad: '',
  consuladoDeseado: '',
  oficinaCAS: '',
  // Campos anteriores para compatibilidad
  ciudadNacimiento: '',
  estadoNacimiento: '',
  paisNacimiento: '',
  idiomas: '',
  citaCAS: '',
  // Paso 2
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
  estadoCivil: '',
  nombreQuienPaga: '',
  personasQueViajan: '',
  // Campos anteriores para compatibilidad
  ciudadCita: '',
  // Paso 4
  nombrePatrocinador: '',
  parentesco: '',
  // Paso 7
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
        currentStep: state.currentStep,
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