/** @Author Justin Jantzi, Max Stein */

import { Component, ElementRef, Input } from '@angular/core';

@Component({
    selector: 'app-accordion',
    templateUrl: './accordion.component.html',
    styleUrls: ['../components.css'],
    standalone: false
})
export class AccordionComponent {
  @Input() title: string = '';
  @Input() extra: string[] = [];
  @Input() color: string = '';

  constructor(private elementRef: ElementRef) {}

  //after render function
  ngAfterViewInit() {
    const element = this.elementRef.nativeElement as HTMLElement;
    const clickAccordionButton = element.querySelector('.accordion-button') as HTMLElement;

    clickAccordionButton.addEventListener('click', (event) => {

      // programmatically was clicked
      if(event.detail === 0) return;

      //get all siblings of the clicked element
      const siblings = Array.from(element.parentElement?.children as HTMLCollectionOf<HTMLElement>);

      console.log(element.parentElement);

      siblings.forEach(sibling => {

        //skip the clicked element
        if(sibling === element) return;

        //recursively close all accordian-button elements of the sibling
        const siblingAccordionButtons = sibling.querySelectorAll('.accordion-button') as NodeListOf<HTMLElement>;

        siblingAccordionButtons.forEach(siblingAccordionButton => {
          //if the sibling is open, close it
          if(siblingAccordionButton.getAttribute('aria-expanded') === 'true') {
            siblingAccordionButton.click();
          }
        })
      })
    })
  }
}
