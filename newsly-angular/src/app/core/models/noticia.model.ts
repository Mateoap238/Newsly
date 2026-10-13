export type EstadoNoticia = 'publicada' | 'borrador';

export interface Noticia {
  id: number;
  titulo: string;
  slug: string;
  categoria: string;
  descripcion: string;
  contenido: string[];
  imagen: string;
  autor: string;
  fecha: string;
  tiempoLectura: number;
  destacada: boolean;
  estado: EstadoNoticia;
}

export const CATEGORIAS = ['Tecnología', 'Educación', 'Turismo', 'Negocios'] as const;

export const ICONO_CATEGORIA: Record<string, string> = {
  'Tecnología': 'bi-cpu',
  'Educación': 'bi-mortarboard',
  'Turismo': 'bi-compass',
  'Negocios': 'bi-graph-up-arrow',
};

export const CLASE_CATEGORIA: Record<string, string> = {
  'Tecnología': 'tecnologia',
  'Educación': 'educacion',
  'Turismo': 'turismo',
  'Negocios': 'negocios',
};
