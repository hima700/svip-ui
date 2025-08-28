import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {NgbModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {ButtonComponent} from './shared/components/button/button.component';
import {UploadComponent} from './features/upload/upload.component';
import {ViewComponent} from './features/view/view.component';
import {NavbarComponent} from './shared/components/navbar/navbar.component';
import {ToggleComponent} from './shared/components/toggle/toggle.component';
import {ModalComponent} from './shared/components/modal/modal.component';
import {MultiselectDropdownComponent} from './shared/components/multiselect-dropdown/multiselect-dropdown.component';
import {MenuComponent} from './shared/components/menu/menu.component';
import {AccordionComponent} from './shared/components/accordion/accordion.component';
import {ToastComponent} from './shared/components/toast/toast.component';
import {ComparisonComponent} from './features/comparison/comparison.component';
import {CompareModalComponent} from './shared/components/toolbar/modals/compare-modal/compare-modal.component'
import {ConvertModalComponent} from './shared/components/toolbar/modals/convert-modal/convert-modal.component';
import {DeleteModalComponent} from './shared/components/toolbar/modals/delete-modal/delete-modal.component';
import {ViewerComponent} from './shared/components/viewer/viewer.component';
import {ToasterComponent} from './shared/components/toaster/toaster.component';
import {VexComponent} from './features/vex/vex.component';
import {CircleToggleComponent} from './shared/components/circle-toggle/circle-toggle.component';
import {QaFiltersComponent} from './features/metrics/qa-filters/qa-filters.component';
import {MetricsComponent} from './features/metrics/metrics/metrics.component';
import {MergeModalComponent} from './shared/components/toolbar/modals/merge-modal/merge-modal.component';
import {GenerateModalComponent} from './shared/components/toolbar/modals/generate-modal/generate-modal.component';
import {DiffFiltersComponent} from './features/comparison/diff-filters/diff-filters.component';
import {SpinnerComponent} from './shared/components/spinner/spinner.component';
import {RepairModalComponent} from './shared/components/toolbar/modals/repair-modal/repair-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    ButtonComponent,
    UploadComponent,
    ViewComponent,
    NavbarComponent,
    ToggleComponent,
    MultiselectDropdownComponent,
    AccordionComponent,
    MenuComponent,
    ModalComponent,
    ToastComponent,
    ComparisonComponent,
    ToasterComponent,
    CompareModalComponent,
    ConvertModalComponent,
    DeleteModalComponent,
    ViewerComponent,
    VexComponent,
    MetricsComponent,
    CircleToggleComponent,
    QaFiltersComponent,
    MergeModalComponent,
    GenerateModalComponent,
    SpinnerComponent,
    DiffFiltersComponent,
    RepairModalComponent
  ],
  bootstrap: [AppComponent],
  imports: [BrowserModule, NgbModule, NgbTooltipModule, FormsModule],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule {
}
