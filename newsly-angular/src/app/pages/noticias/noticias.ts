import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CATEGORIAS, Noticia } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { TarjetaNoticia } from '../../shared/tarjeta-noticia/tarjeta-noticia';

const TAMANO_PAGINA = 6;

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [CommonModule, FormsModule, TarjetaNoticia],
  templateUrl: './noticias.html',
})
export class NoticiasPage implements OnInit {
  private readonly noticiasService = inject(NoticiasService);
  private readonly route = inject(ActivatedRoute);

  protected readonly CATEGORIAS = CATEGORIAS;
  protected readonly todas = signal<Noticia[]>([]);
  protected readonly paginaActual = signal(1);

  protected texto = '';
  protected categoria = 'Todas';
  protected orden: 'recientes' | 'antiguas' | 'titulo' = 'recientes';

  protected readonly conteo = computed(() => this.noticiasService.contarPorCategoria(this.todas()));
  protected readonly totalPublicadas = computed(() => Object.values(this.conteo()).reduce((a, b) => a + b, 0));

  protected readonly filtradas = computed(() =>
    this.noticiasService.filtrarNoticias(this.todas(), {
      texto: this.textoSignal(),
      categoria: this.categoriaSignal(),
      orden: this.ordenSignal(),
    }),
  );

  protected readonly visibles = computed(() => this.filtradas().slice(0, this.paginaActual() * TAMANO_PAGINA));

  // Señales espejo de los campos ligados por ngModel, para que `computed` reaccione a sus cambios.
  private readonly textoSignal = signal('');
  private readonly categoriaSignal = signal('Todas');
  private readonly ordenSignal = signal<'recientes' | 'antiguas' | 'titulo'>('recientes');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('q')) {
      this.texto = params.get('q')!;
      this.textoSignal.set(this.texto);
    }
    if (params.get('categoria')) {
      this.categoria = params.get('categoria')!;
      this.categoriaSignal.set(this.categoria);
    }

    this.noticiasService.obtenerNoticias().subscribe((noticias) => this.todas.set(noticias));
  }

  actualizarTexto(): void {
    this.textoSignal.set(this.texto);
    this.paginaActual.set(1);
  }

  seleccionarCategoria(categoria: string): void {
    this.categoria = categoria;
    this.categoriaSignal.set(categoria);
    this.paginaActual.set(1);
  }

  actualizarOrden(): void {
    this.ordenSignal.set(this.orden);
  }

  cargarMas(): void {
    this.paginaActual.update((p) => p + 1);
  }

  restablecer(): void {
    this.texto = '';
    this.categoria = 'Todas';
    this.orden = 'recientes';
    this.textoSignal.set('');
    this.categoriaSignal.set('Todas');
    this.ordenSignal.set('recientes');
    this.paginaActual.set(1);
  }
}
