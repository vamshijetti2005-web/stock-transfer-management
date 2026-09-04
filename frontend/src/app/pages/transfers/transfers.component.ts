import { Component } from '@angular/core';

@Component({
  selector: 'app-transfers',
  standalone: true,
  template: `
    <section class="page">
      <header class="page-header">
        <h1>Transfers</h1>
        <p>Create requests, manage status, and view transfer history.</p>
      </header>
      <div class="placeholder">
        Transfer list and status actions will appear here.
      </div>
    </section>
  `,
  styles: [
    `
      .page-header h1 {
        margin: 0 0 0.25rem;
        font-size: 1.5rem;
      }
      .page-header p {
        margin: 0 0 1.25rem;
        color: #5b6472;
      }
      .placeholder {
        padding: 2rem;
        border: 1px dashed #c5ccd6;
        border-radius: 8px;
        color: #6b7280;
        background: #f8fafc;
      }
    `,
  ],
})
export class TransfersComponent {}
