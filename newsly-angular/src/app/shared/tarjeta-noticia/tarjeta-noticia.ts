import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Noticia, CLASE_CATEGORIA } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-tarjeta-noticia',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tarjeta-noticia.html',
})
export class TarjetaNoticia {
  readonly noticia = input.required<Noticia>();

  protected readonly noticiasService = inject(NoticiasService);
  protected readonly storage = inject(StorageService);
  protected readonly CLASE_CATEGORIA = CLASE_CATEGORIA;

  toggleFavorito(evento: Event): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.storage.alternarFavorito(this.noticia().id);
  }
}
