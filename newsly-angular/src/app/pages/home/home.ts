import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Noticia, CATEGORIAS, ICONO_CATEGORIA, CLASE_CATEGORIA } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { StorageService } from '../../core/services/storage.service';
import { TarjetaNoticia } from '../../shared/tarjeta-noticia/tarjeta-noticia';

const DESCRIPCION_CATEGORIA: Record<string, string> = {
  'Tecnología': 'Inteligencia artificial, computación cuántica y ciberdefensa.',
  'Educación': 'Innovación pedagógica, investigación y campus inteligentes.',
  'Turismo': 'Ecoturismo, patrimonio natural y hospitalidad sostenible.',
  'Negocios': 'Economía circular, finanzas corporativas y mercados limpios.',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TarjetaNoticia],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private readonly noticiasService = inject(NoticiasService);
  protected readonly storage = inject(StorageService);

  protected readonly CATEGORIAS = CATEGORIAS;
  protected readonly ICONO_CATEGORIA = ICONO_CATEGORIA;
  protected readonly CLASE_CATEGORIA = CLASE_CATEGORIA;
  protected readonly DESCRIPCION_CATEGORIA = DESCRIPCION_CATEGORIA;

  protected readonly cargando = signal(true);
  protected readonly hero = signal<Noticia | null>(null);
  protected readonly otrasDestacadas = signal<Noticia[]>([]);
  protected readonly conteoCategorias = signal<Record<string, number>>({});
  protected readonly principal = signal<Noticia | null>(null);
  protected readonly resto = signal<Noticia[]>([]);

  protected correoNewsletter = '';
  protected mensajeNewsletter = '';

  ngOnInit(): void {
    this.noticiasService.obtenerNoticias().subscribe((todas) => {
      const publicas = todas.filter((n) => n.estado !== 'borrador');
      const destacadas = publicas.filter((n) => n.destacada);

      const hero = destacadas.find((n) => n.categoria === 'Tecnología') ?? destacadas[0] ?? publicas[0] ?? null;
      this.hero.set(hero);
      this.otrasDestacadas.set(destacadas.filter((n) => n.id !== hero?.id).slice(0, 3));
      this.conteoCategorias.set(this.noticiasService.contarPorCategoria(publicas));

      const restantes = [...publicas]
        .filter((n) => n.id !== hero?.id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
      this.principal.set(restantes[0] ?? null);
      this.resto.set(restantes.slice(1, 4));

      this.cargando.set(false);
    });
  }

  formatearFecha(fecha: string): string {
    return this.noticiasService.formatearFecha(fecha);
  }

  iniciales(nombre: string): string {
    return this.noticiasService.iniciales(nombre);
  }

  toggleFavoritoHero(): void {
    const h = this.hero();
    if (h) this.storage.alternarFavorito(h.id);
  }

  suscribir(): void {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(this.correoNewsletter.trim())) {
      this.mensajeNewsletter = 'Ingresa un correo electrónico válido.';
      return;
    }
    this.mensajeNewsletter = '¡Listo! Te suscribiste al newsletter semanal.';
    this.correoNewsletter = '';
  }
}
