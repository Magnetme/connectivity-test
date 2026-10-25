[![Magnet.me Logo](https://cdn.magnet.me/images/logo-2015-full.svg)](https://magnet.me "Discover the best companies, jobs and internships at Magnet.me")

# Connectivity test

Accessible under multiple URLs:

- [connectivity.magnet.me](http://connectivity.magnet.me)
- [connectivity-test.magnet.me](http://connectivity-test.magnet.me)
- [x.magnet.me](http://x.magnet.me)
- [x.magnetme.com](http://x.magnetme.com)
- [connectivity.magnetme.com](http://connectivity.magnetme.com)

All domains also work under HTTPS, but primarily __test under HTTP__!

## Why

Sometimes people notify us of connectivity problems.
This system can remotely be run to quickly determine where these problems lie.
Generally it's not on the Magnet.me end, but it can be difficult to show this.
This test provides a quick and visual result to show to other parties where the problem may lie.

## How

1. Send a recruiter who reports any problem one of the above links (in case of a domain block, use the magnetme.com domain).
1. Let them share the results back with us.
1. Our IT can then infer where the problem approximately lies.
    1. If this is on our end, escalate it to get it fixed asap.
    1. If it is on the remote end, provide information back to the client, which they may in turn escalate to their IT department.
1. Offer to let one of our IT guys to help with a call, if required.

Example gif of the system running in a browser (might be outdated):
 
![Example gif](https://s3-eu-west-1.amazonaws.com/uploads-eu.hipchat.com/65597/687838/FJSo93ECw0kwmHk/2017-12-04%2023.40.49.gif)

## Tech things

1. Let the test always run under HTTP, otherwise a browser will probably refuse the HTTP tests (insecure content)
1. Hosted by AWS Cloudfront in production
1. Build by Jenkins and auto-pushed
1. The tests initiate with a small and randomized delay. Otherwise them complete that quickly that is look like it's not real #firstFeedback.
1. Obviously in React.
1. Also logs some stuff about the environment, as sometimes the problem may reside there (and not in the network path).

## HTTP protocol checks

The HTTP/2 and HTTP/3 rows read the protocol returned by
`https://clients.magnet.me/http_version`, with caching disabled. Each row passes
only when that exact protocol is observed. Both rows show only **Passed** or
**Failed**; other selections fail that observation check. Browsers choose the
protocol; a fallback does not establish whether the alternative is blocked.
Full results remain available in the console.

HTTP/3 gets up to four requests, spaced 500 ms apart, so the browser can discover
the server's `Alt-Svc` advertisement and negotiate QUIC. Each request, including
its response body, has a three-second timeout. A request error or invalid response
fails the check. HTTP/3 remains optional: HTTP/2 and HTTP/1.1 fallback can still
provide working connectivity.

The checks run independently and hold no shared mutable state. Concurrent
requests can affect the browser's protocol choice, which is why an unobserved
protocol is inconclusive. Cached responses cannot pass the check, timeouts cover
body reads, and late responses cannot change an already completed row.

A strict HTTP/2 capability test would need a separate endpoint that offers HTTP/2
without HTTP/3. Browser JavaScript cannot force that choice on the shared endpoint.

## TLS checks

TLSv1.2 appears above TLSv1.3. Both show only **Passed** or **Failed**.
TLSv1.2 checks a minimum version: TLSv1.2 and TLSv1.3 both pass. TLSv1.3
requires TLSv1.3. Both use `https://clients.magnet.me/ssl_protocol`.
Browser JavaScript cannot force a TLSv1.2 handshake, so this does not separately
prove that a TLSv1.2-only client can connect.
