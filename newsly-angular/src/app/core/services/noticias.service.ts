import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { CATEGORIAS, Noticia } from '../models/noticia.model';
import { StorageService } from './storage.service';

export interface FiltroNoticias {
  texto?: string;
  categoria?: string;
  orden?: 'recientes' | 'antiguas' | 'titulo';
}

/**
 * Combina el catálogo base (data/noticias.json) con las noticias creadas
 * desde Administración y descarta las eliminadas, para que todas las
 * páginas trabajen siempre sobre el mismo conjunto de datos.
 */
@Injectable({ providedIn: 'root' })
export class NoticiasService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  private base$?: Observable<Noticia[]>;

  private cargarNoticiasBase(): Observable<Noticia[]> {
    if (!this.base$) {
      this.base$ = this.http.get<Noticia[]>('data/noticias.json').pipe(shareReplay(1));
    }
    return this.base$;
  }

  obtenerNoticias(): Observable<Noticia[]> {
    return this.cargarNoticiasBase().pipe(
      map((base) => {
        const personalizadas = this.storage.obtenerNoticiasPersonalizadas();
        const eliminadas = this.storage.obtenerNoticiasEliminadas();
        const combinadas = [...personalizadas, ...base];
        const vistas = new Set<number>();
        return combinadas.filter((n) => {
          if (eliminadas.includes(n.id) || vistas.has(n.id)) return false;
          vistas.add(n.id);
          return true;
        });
      }),
    );
  }

  obtenerNoticiaPorId(id: number): Observable<Noticia | undefined> {
    return this.obtenerNoticias().pipe(map((noticias) => noticias.find((n) => n.id === Number(id))));
  }

  formatearFecha(fechaISO: string): string {
    try {
      const fecha = new Date(`${fechaISO}T00:00:00`);
      return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return fechaISO;
    }
  }

  iniciales(nombre: string): string {
    return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  }

  filtrarNoticias(noticias: Noticia[], opciones: FiltroNoticias = {}): Noticia[] {
    const { texto = '', categoria = 'Todas', orden = 'recientes' } = opciones;
    const textoNormalizado = texto.trim().toLowerCase();

    let resultado = noticias.filter((n) => n.estado !== 'borrador');

    if (categoria && categoria !== 'Todas') {
      resultado = resultado.filter((n) => n.categoria === categoria);
    }

    if (textoNormalizado) {
      resultado = resultado.filter((n) => {
        const campos = [n.titulo, n.descripcion, n.categoria, n.autor];
        return campos.some((c) => c?.toLowerCase().includes(textoNormalizado));
      });
    }

    return [...resultado].sort((a, b) => {
      if (orden === 'antiguas') return a.fecha.localeCompare(b.fecha);
      if (orden === 'titulo') return a.titulo.localeCompare(b.titulo, 'es');
      return b.fecha.localeCompare(a.fecha);
    });
  }

  contarPorCategoria(noticias: Noticia[]): Record<string, number> {
    const conteo = Object.fromEntries(CATEGORIAS.map((c) => [c, 0])) as Record<string, number>;
    noticias.forEach((n) => {
      if (n.estado === 'borrador') return;
      if (conteo[n.categoria] !== undefined) conteo[n.categoria] += 1;
    });
    return conteo;
  }
}
