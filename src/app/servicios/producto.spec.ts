import { TestBed } from '@angular/core/testing';
import { ProductoService } from './producto';

describe('Producto', () => {
  let service: ProductoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductoService]
    });
    service = TestBed.inject(ProductoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
