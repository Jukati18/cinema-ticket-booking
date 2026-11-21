# Stitch desktop redesign — 19/11/2026

Read-only MCP source: project 9620295992814181764. No Stitch screens were edited.

Screens used:
- Home: 078c6c891b33476cad9240e441d59294
- Movie detail / showtimes: c512e1d99e494dfc9a854a7763453419
- Seats / concessions: 057b4fdb47de4676bc342917adb0ef7d
- Contact / payment choice: cd46f3b91fbc4bc2a7f69bab63aab023
- Payment: eb856bec87e349e9a8b54b25f2fdb0c3
- Ticket: ad6ecd8025df47f69b9bf32e79fc85bc

Implementation: new homepage grid and manual banner, independent quick-booking fields, new /movies/:movieId detail and /schedule route, all-cinema default, grouped format sessions without room/price/remaining-seat labels. Shared desktop treatment for seats, combo rows, checkout, payment, lookup and perforated ticket with QR. Real imported movie posters and backdrops retained rather than generated screenshot-like assets from the reference.

GIAM20K is a demo-only 20,000 VND promotion, capped by subtotal, validated by mock hold APIs. Discount snapshot passes to booking, payment and ticket totals; checkout can update a live hold's promotion. Production endpoint PATCH /holds/:id/promotion is provisional and requires backend agreement. Real createHold adapter also needs the final agreed promotion contract before enabling API mode.

Auth pages are visual forms only pending the group's authentication service. Admin remains outside this customer's frontend assignment. No paid payment, email delivery, production check-in validation or account authentication is claimed. Ticket QR contains a demo reference only.

No commits, pushes, deployments or Jira mutations.
