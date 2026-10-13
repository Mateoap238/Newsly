import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CATEGORIAS, Noticia, CLASE_CATEGORIA } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { StorageService } from '../../core/services/storage.service';

const IMAGEN_PLACEHOLDER = 'assets/images/placeholder-noticia.jpg';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './administracion.html',
})
export class Administracion implements OnInit {
  private readonly noticiasService = inject(NoticiasService);
  private readonly storage = inject(StorageService);
  private readonly fb = new FormBuilder();

  protected readonly CATEGORIAS = CATEGORIAS;
  protected readonly CLASE_CATEGORIA = CLASE_CATEGORIA;

  protected readonly todas = signal<Noticia[]>([]);
  protected busqueda = '';
  protected categoriaFiltro = 'Todas';
  protected estadoFiltro = 'Todos';
  private readonly busquedaSignal = signal('');
  private readonly categoriaFiltroSignal = signal('Todas');
  private readonly estadoFiltroSignal = signal('Todos');

  protected readonly filtradas = computed(() => {
    const texto = this.busquedaSignal().trim().toLowerCase();
    const categoria = this.categoriaFiltroSignal();
    const estado = this.estadoFiltroSignal();
    return this.todas().filter((n) => {
      if (categoria !== 'Todas' && n.categoria !== categoria) return false;
      if (estado !== 'Todos' && n.estado !== estado) return false;
      if (texto) {
        const campos = [n.titulo, n.autor, n.categoria, n.descripcion];
        if (!campos.some((c) => c?.toLowerCase().includes(texto))) return false;
      }
      return true;
    });
  });

  protected readonly total = computed(() => this.todas().length);
  protected readonly publicadas = computed(() => this.todas().filter((n) => n.estado === 'publicada').length);
  protected readonly borradores = computed(() => this.todas().filter((n) => n.estado === 'borrador').length);
  protected readonly velocidadLectura = computed(() => {
    const t = this.total();
    if (!t) return '0';
    return (this.todas().reduce((s, n) => s + (n.tiempoLectura || 0), 0) / t).toFixed(1);
  });

  protected readonly mensaje = signal<{ texto: string; tipo: 'exito' | 'error' } | null>(null);
  protected readonly idPendienteEliminar = signal<number | null>(null);
  protected readonly noticiaPendiente = computed(() => this.todas().find((n) => n.id === this.idPendienteEliminar()) ?? null);

  protected readonly formulario = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(90)]],
    categoria: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(220)]],
    contenido: ['', [Validators.required, Validators.minLength(40)]],
    autor: ['', [Validators.required, Validators.minLength(3)]],
    imagen: [''],
  });

  ngOnInit(): void {
    this.recargar();
  }

  irAFormulario(): void {
    document.getElementById('panelCrear')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private recargar(): void {
    this.noticiasService.obtenerNoticias().subscribe((noticias) => {
      this.todas.set([...noticias].sort((a, b) => b.fecha.localeCompare(a.fecha)));
    });
  }

  actualizarBusqueda(): void {
    this.busquedaSignal.set(this.busqueda);
  }

  actualizarCategoriaFiltro(): void {
    this.categoriaFiltroSignal.set(this.categoriaFiltro);
  }

  actualizarEstadoFiltro(): void {
    this.estadoFiltroSignal.set(this.estadoFiltro);
  }

  invalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private mostrarMensaje(texto: string, tipo: 'exito' | 'error'): void {
    this.mensaje.set({ texto, tipo });
    window.setTimeout(() => this.mensaje.set(null), 6000);
  }

  private generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  guardar(estado: 'publicada' | 'borrador'): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mostrarMensaje('Revisa los campos marcados en rojo antes de continuar.', 'error');
      return;
    }

    const valores = this.formulario.getRawValue();
    const contenido = (valores.contenido ?? '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const palabras = contenido.join(' ').split(/\s+/).filter(Boolean).length;

    const nuevaNoticia: Noticia = {
      id: this.storage.siguienteIdPersonalizado(),
      titulo: valores.titulo!.trim(),
      slug: this.generarSlug(valores.titulo!),
      categoria: valores.categoria!,
      descripcion: valores.descripcion!.trim(),
      contenido,
      imagen: valores.imagen?.trim() || IMAGEN_PLACEHOLDER,
      autor: valores.autor!.trim(),
      fecha: new Date().toISOString().slice(0, 10),
      tiempoLectura: Math.max(1, Math.round(palabras / 200)),
      destacada: false,
      estado,
    };

    this.storage.guardarNoticiaPersonalizada(nuevaNoticia);
    this.formulario.reset({ titulo: '', categoria: '', descripcion: '', contenido: '', autor: '', imagen: '' });
    this.recargar();
    this.mostrarMensaje(
      estado === 'publicada'
        ? `Noticia publicada con éxito (ID #NW-${nuevaNoticia.id}). Ya es visible en el portal.`
        : `Noticia guardada como borrador (ID #NW-${nuevaNoticia.id}).`,
      'exito',
    );
  }

  abrirModalEliminar(id: number): void {
    this.idPendienteEliminar.set(id);
  }

  cerrarModal(): void {
    this.idPendienteEliminar.set(null);
  }

  confirmarEliminacion(): void {
    const id = this.idPendienteEliminar();
    if (id === null) return;
    const esPersonalizada = this.storage.obtenerNoticiasPersonalizadas().some((n) => n.id === id);
    if (esPersonalizada) {
      this.storage.eliminarNoticiaPersonalizada(id);
    } else {
      this.storage.marcarNoticiaEliminada(id);
    }
    this.cerrarModal();
    this.recargar();
    this.mostrarMensaje('Noticia eliminada del portal correctamente.', 'exito');
  }
}
