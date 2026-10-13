import { Injectable, signal } from '@angular/core';
import { Noticia } from '../models/noticia.model';

const CLAVES = {
  favoritos: 'newsly_favoritos_v1',
  personalizadas: 'newsly_noticias_personalizadas_v1',
  eliminadas: 'newsly_noticias_eliminadas_v1',
};

function leerJSON<T>(clave: string, valorPorDefecto: T): T {
  try {
    const crudo = localStorage.getItem(clave);
    if (!crudo) return valorPorDefecto;
    const datos = JSON.parse(crudo);
    return datos ?? valorPorDefecto;
  } catch (error) {
    console.warn(`Newsly: datos corruptos en "${clave}", se restablece.`, error);
    return valorPorDefecto;
  }
}

function guardarJSON<T>(clave: string, datos: T): void {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch (error) {
    console.error(`Newsly: no se pudo guardar "${clave}".`, error);
  }
}

/**
 * Encapsula todo el acceso a localStorage: favoritos, noticias creadas
 * desde Administración y noticias eliminadas del catálogo base.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly favoritos = signal<number[]>(this.obtenerFavoritos());

  obtenerFavoritos(): number[] {
    const favoritos = leerJSON<number[]>(CLAVES.favoritos, []);
    return Array.isArray(favoritos) ? [...new Set(favoritos)] : [];
  }

  esFavorito(id: number): boolean {
    return this.favoritos().includes(Number(id));
  }

  alternarFavorito(id: number): boolean {
    const idNum = Number(id);
    const actuales = [...this.favoritos()];
    const indice = actuales.indexOf(idNum);
    if (indice >= 0) {
      actuales.splice(indice, 1);
    } else {
      actuales.push(idNum);
    }
    guardarJSON(CLAVES.favoritos, actuales);
    this.favoritos.set(actuales);
    return actuales.includes(idNum);
  }

  eliminarFavorito(id: number): void {
    const actuales = this.favoritos().filter((f) => f !== Number(id));
    guardarJSON(CLAVES.favoritos, actuales);
    this.favoritos.set(actuales);
  }

  limpiarFavoritos(): void {
    guardarJSON(CLAVES.favoritos, []);
    this.favoritos.set([]);
  }

  obtenerNoticiasPersonalizadas(): Noticia[] {
    return leerJSON<Noticia[]>(CLAVES.personalizadas, []);
  }

  guardarNoticiaPersonalizada(noticia: Noticia): void {
    const noticias = this.obtenerNoticiasPersonalizadas();
    noticias.unshift(noticia);
    guardarJSON(CLAVES.personalizadas, noticias);
  }

  eliminarNoticiaPersonalizada(id: number): void {
    const noticias = this.obtenerNoticiasPersonalizadas().filter((n) => n.id !== Number(id));
    guardarJSON(CLAVES.personalizadas, noticias);
  }

  obtenerNoticiasEliminadas(): number[] {
    return leerJSON<number[]>(CLAVES.eliminadas, []);
  }

  marcarNoticiaEliminada(id: number): void {
    const eliminadas = this.obtenerNoticiasEliminadas();
    const idNum = Number(id);
    if (!eliminadas.includes(idNum)) {
      eliminadas.push(idNum);
      guardarJSON(CLAVES.eliminadas, eliminadas);
    }
  }

  siguienteIdPersonalizado(): number {
    const personalizadas = this.obtenerNoticiasPersonalizadas();
    const maximo = personalizadas.reduce((max, n) => Math.max(max, n.id), 1000);
    return maximo + 1;
  }
}
