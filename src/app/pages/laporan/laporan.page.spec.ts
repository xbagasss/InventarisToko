import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaporanPage } from './laporan.page';

describe('LaporanPage', () => {
  let component: LaporanPage;
  let fixture: ComponentFixture<LaporanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LaporanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
