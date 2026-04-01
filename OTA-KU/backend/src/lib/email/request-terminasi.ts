// TODO: Perlu disepakatin, perlu ngirim email ke pasangan ga kalo lawan pasangannya nge request terminasi?

export function requestTerminasiEmail(
  nama: string,
  nama_lawan_asuh: string,
  role: "ota" | "ma",
  linkWa: string,
) {
  return `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title></title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }
  </style>
  <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
  <!--[if lte mso 11]>
    <style type="text/css">
      .mj-outlook-group-fix { width:100% !important; }
    </style>
    <![endif]-->

  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
  </style>
  <!--<![endif]-->



  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }
  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }
  </style>


  <style type="text/css">
    @media only screen and (max-width:479px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }
  </style>
  <style type="text/css">
    .link-nostyle {
      color: inherit;
      text-decoration: none
    }


    a {
      color: #cf549e;
    }
  </style>

</head>

<body style="word-spacing:normal;background-color:#f6f9fc;">


  <div style="background-color:#f6f9fc;">


    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->


    <div style="background:initial;background-color:initial;margin:0px auto;max-width:600px;">

      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="background:initial;background-color:initial;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->

              

              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>

    </div>


    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->


    <div style="background:initial;background-color:initial;margin:0px auto;max-width:600px;">

      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="background:initial;background-color:initial;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0 20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="shadow-outlook" style="vertical-align:top;width:560px;" ><![endif]-->

              <div class="mj-column-per-100 mj-outlook-group-fix shadow"
                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">

                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
                  width="100%">
                  <tbody>

                    <tr>
                      <td style="font-size:0px;padding:25px 25px 0px 25px;word-break:break-word;">


                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#003399" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->


                        <div
                          style="background:#003399;background-color:#003399;margin:0px auto;border-radius:24px 24px 0px 0px;max-width:560px;">

                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="background:#003399;background-color:#003399;width:100%;border-radius:24px 24px 0px 0px;">
                            <tbody>
                              <tr>
                                <td style="direction:ltr;font-size:0px;padding:20px;text-align:center;">
                                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:520px;" ><![endif]-->

                                  <div class="mj-column-per-100 mj-outlook-group-fix"
                                    style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">

                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                      style="vertical-align:top;" width="100%">
                                      <tbody>

                                        <tr>
                                          <td align="center"
                                            style="font-size:0px;padding:10px 25px;word-break:break-word;">

                                            <div
                                              style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:20px;font-weight:700;line-height:24px;text-align:center;color:#ffffff;">
                                              Permintaan Pemutusan Bantuan Asuh</div>

                                          </td>
                                        </tr>

                                      </tbody>
                                    </table>

                                  </div>

                                  <!--[if mso | IE]></td></tr></table><![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>

                        </div>


                        <!--[if mso | IE]></td></tr></table><![endif]-->


                      </td>
                    </tr>

                    <tr>
                      <td style="font-size:0px;padding:0px 25px;word-break:break-word;">


                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->


                        <div
                          style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;border-radius:0px 0px 16px 16px;max-width:560px;">

                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="background:#FFFFFF;background-color:#FFFFFF;width:100%;border-radius:0px 0px 16px 16px;">
                            <tbody>
                              <tr>
                                <td style="direction:ltr;font-size:0px;padding:20px 25px;text-align:center;">
                                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:510px;" ><![endif]-->

                                  <div class="mj-column-per-100 mj-outlook-group-fix"
                                    style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">

                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                      style="vertical-align:top;" width="100%">
                                      <tbody>

                                        <tr>
                                          <td align="left"
                                            style="font-size:0px;padding:10px 0px 10px 0px;word-break:break-word;">

                                            <div
                                              style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:16px;text-align:left;color:#003A6E;">
                                              Halo <b>${nama_lawan_asuh}</b>,<br/><br/>
                                              <div>${role == "ota" ? "Orang Tua Asuh" : "Mahasiswa Asuh"} Anda<b>, ${nama}, </b>telah mengajukan permintaan
                                                untuk menghentikan Bantuan Asuh. </div><br/>
                                              <div>Silahkan hubungi pengurus IOM ITB untuk informasi lebih lanjut atau
                                                tindak lanjut dari informasi ini</div>
                                              <div><br/></div>
                                            </div>

                                          </td>
                                        </tr>

                                        <tr>
                                          <td align="center" vertical-align="middle"
                                            style="font-size:0px;padding:12px 30px;word-break:break-word;">

                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                              style="border-collapse:separate;line-height:100%;">
                                              <tbody>
                                                <tr>
                                                  <td align="center" bgcolor="#003399" role="presentation"
                                                    style="border:none;border-radius:4px;cursor:auto;mso-padding-alt:10px 25px;background:#003399;"
                                                    valign="middle">
                                                    <a href="${linkWa}"
                                                      style="display:inline-block;background:#003399;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:4px;"
                                                      target="_blank">
                                                      <img alt="Hubungi  Pengurus" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5LjA1IDQuOTA5OTlDMTguMTMzMSAzLjk4NDEgMTcuMDQxIDMuMjQ5OTYgMTUuODM3NSAyLjc1MDM2QzE0LjYzNCAyLjI1MDc1IDEzLjM0MzEgMS45OTU2OCAxMi4wNCAxLjk5OTk5QzYuNTc5OTkgMS45OTk5OSAyLjEyOTk5IDYuNDQ5OTkgMi4xMjk5OSAxMS45MUMyLjEyOTk5IDEzLjY2IDIuNTg5OTkgMTUuMzYgMy40NDk5OSAxNi44NkwyLjA0OTk5IDIyTDcuMjk5OTkgMjAuNjJDOC43NDk5OSAyMS40MSAxMC4zOCAyMS44MyAxMi4wNCAyMS44M0MxNy41IDIxLjgzIDIxLjk1IDE3LjM4IDIxLjk1IDExLjkyQzIxLjk1IDkuMjY5OTkgMjAuOTIgNi43Nzk5OSAxOS4wNSA0LjkwOTk5Wk0xMi4wNCAyMC4xNUMxMC41NiAyMC4xNSA5LjEwOTk5IDE5Ljc1IDcuODM5OTkgMTlMNy41Mzk5OSAxOC44Mkw0LjQxOTk5IDE5LjY0TDUuMjQ5OTkgMTYuNkw1LjA0OTk5IDE2LjI5QzQuMjI3NTQgMTQuOTc3MSAzLjc5MDkxIDEzLjQ1OTMgMy43ODk5OSAxMS45MUMzLjc4OTk5IDcuMzY5OTkgNy40ODk5OSAzLjY2OTk5IDEyLjAzIDMuNjY5OTlDMTQuMjMgMy42Njk5OSAxNi4zIDQuNTI5OTkgMTcuODUgNi4wODk5OUMxOC42MTc2IDYuODUzODYgMTkuMjI1OSA3Ljc2MjU0IDE5LjYzOTYgOC43NjMzMkMyMC4wNTMzIDkuNzY0MTEgMjAuMjY0MiAxMC44MzcxIDIwLjI2IDExLjkyQzIwLjI4IDE2LjQ2IDE2LjU4IDIwLjE1IDEyLjA0IDIwLjE1Wk0xNi41NiAxMy45OUMxNi4zMSAxMy44NyAxNS4wOSAxMy4yNyAxNC44NyAxMy4xOEMxNC42NCAxMy4xIDE0LjQ4IDEzLjA2IDE0LjMxIDEzLjNDMTQuMTQgMTMuNTUgMTMuNjcgMTQuMTEgMTMuNTMgMTQuMjdDMTMuMzkgMTQuNDQgMTMuMjQgMTQuNDYgMTIuOTkgMTQuMzNDMTIuNzQgMTQuMjEgMTEuOTQgMTMuOTQgMTEgMTMuMUMxMC4yNiAxMi40NCA5Ljc2OTk5IDExLjYzIDkuNjE5OTkgMTEuMzhDOS40Nzk5OSAxMS4xMyA5LjU5OTk5IDExIDkuNzI5OTkgMTAuODdDOS44Mzk5OSAxMC43NiA5Ljk3OTk5IDEwLjU4IDEwLjEgMTAuNDRDMTAuMjIgMTAuMyAxMC4yNyAxMC4xOSAxMC4zNSAxMC4wM0MxMC40MyA5Ljg1OTk5IDEwLjM5IDkuNzE5OTkgMTAuMzMgOS41OTk5OUMxMC4yNyA5LjQ3OTk5IDkuNzY5OTkgOC4yNTk5OSA5LjU2OTk5IDcuNzU5OTlDOS4zNjk5OSA3LjI3OTk5IDkuMTU5OTkgNy4zMzk5OSA5LjAwOTk5IDcuMzI5OTlIOC41Mjk5OUM4LjM1OTk5IDcuMzI5OTkgOC4wOTk5OSA3LjM4OTk5IDcuODY5OTkgNy42Mzk5OUM3LjY0OTk5IDcuODg5OTkgNy4wMDk5OSA4LjQ4OTk5IDcuMDA5OTkgOS43MDk5OUM3LjAwOTk5IDEwLjkzIDcuODk5OTkgMTIuMTEgOC4wMTk5OSAxMi4yN0M4LjEzOTk5IDEyLjQ0IDkuNzY5OTkgMTQuOTQgMTIuMjUgMTYuMDFDMTIuODQgMTYuMjcgMTMuMyAxNi40MiAxMy42NiAxNi41M0MxNC4yNSAxNi43MiAxNC43OSAxNi42OSAxNS4yMiAxNi42M0MxNS43IDE2LjU2IDE2LjY5IDE2LjAzIDE2Ljg5IDE1LjQ1QzE3LjEgMTQuODcgMTcuMSAxNC4zOCAxNy4wMyAxNC4yN0MxNi45NiAxNC4xNiAxNi44MSAxNC4xMSAxNi41NiAxMy45OVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=" style="vertical-align:middle;"/> Hubungi  Pengurus
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>

                                          </td>
                                        </tr>

                                        <tr>
                                          <td align="center"
                                            style="font-size:0px;padding:20px 0;word-break:break-word;">

                                            <p
                                              style="border-top:solid 1px #e9e9e9;font-size:1px;margin:0px auto;width:100%;">
                                            </p>

                                            <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #e9e9e9;font-size:1px;margin:0px auto;width:510px;" role="presentation" width="510px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]-->


                                          </td>
                                        </tr>

                                      </tbody>
                                    </table>

                                  </div>

                                  <!--[if mso | IE]></td></tr></table><![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>

                        </div>


                        <!--[if mso | IE]></td></tr></table><![endif]-->


                      </td>
                    </tr>

                  </tbody>
                </table>

              </div>

              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>

    </div>


    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->


    <div
      style="background:initial;background-color:initial;margin:0px auto;border-radius:0px 0px 16px 16px;max-width:600px;">

      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="background:initial;background-color:initial;width:100%;border-radius:0px 0px 16px 16px;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->

              <div class="mj-column-per-100 mj-outlook-group-fix"
                style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">

                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
                  width="100%">
                  <tbody>

                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">

                        <div
                          style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:24px;text-align:center;color:#8898aa;">
                          © 2025 Bantuan Orang Tua Asuh - IOM ITB.</div>

                      </td>
                    </tr>

                  </tbody>
                </table>

              </div>

              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>

    </div>


    <!--[if mso | IE]></td></tr></table><![endif]-->


  </div>

</body>

</html>`;
}
