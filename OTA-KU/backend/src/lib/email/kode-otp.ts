export function kodeOTPEmail(nama: string, kode: string) {
  return `
<!doctype html>
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <title></title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <o:AllowPNG />
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
    <!--[if lte mso 11]>
      <style type="text/css">
        .mj-outlook-group-fix {
          width: 100% !important;
        }
      </style>
    <![endif]-->

    <!--[if !mso]><!-->
    <link
      href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700"
      rel="stylesheet"
      type="text/css"
    />
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
    </style>
    <!--<![endif]-->

    <style type="text/css">
      @media only screen and (min-width: 480px) {
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
      @media only screen and (max-width: 479px) {
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
        text-decoration: none;
      }

      a {
        color: #cf549e;
      }
    </style>
  </head>

  <body style="word-spacing: normal; background-color: #f6f9fc">
    <div style="background-color: #f6f9fc">
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->

      <div
        style="
          background: initial;
          background-color: initial;
          margin: 0px auto;
          max-width: 600px;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: initial; background-color: initial; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 0px;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->

                

                <!--[if mso | IE]></td></tr></table><![endif]-->
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->

      <div
        style="
          background: initial;
          background-color: initial;
          margin: 0px auto;
          max-width: 600px;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="background: initial; background-color: initial; width: 100%"
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 0 20px;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="shadow-outlook" style="vertical-align:top;width:560px;" ><![endif]-->

                <div
                  class="mj-column-per-100 mj-outlook-group-fix shadow"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          style="
                            font-size: 0px;
                            padding: 25px 25px 0px 25px;
                            word-break: break-word;
                          "
                        >
                          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#003399" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->

                          <div
                            style="
                              background: #003399;
                              background-color: #003399;
                              margin: 0px auto;
                              border-radius: 24px 24px 0px 0px;
                              max-width: 560px;
                            "
                          >
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                background: #003399;
                                background-color: #003399;
                                width: 100%;
                                border-radius: 24px 24px 0px 0px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      direction: ltr;
                                      font-size: 0px;
                                      padding: 20px;
                                      text-align: center;
                                    "
                                  >
                                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:520px;" ><![endif]-->

                                    <div
                                      class="mj-column-per-100 mj-outlook-group-fix"
                                      style="
                                        font-size: 0px;
                                        text-align: left;
                                        direction: ltr;
                                        display: inline-block;
                                        vertical-align: top;
                                        width: 100%;
                                      "
                                    >
                                      <table
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="vertical-align: top"
                                        width="100%"
                                      >
                                        <tbody>
                                          <tr>
                                            <td
                                              align="center"
                                              style="
                                                font-size: 0px;
                                                padding: 10px 25px;
                                                word-break: break-word;
                                              "
                                            >
                                              <div
                                                style="
                                                  font-family:
                                                    Ubuntu, Helvetica, Arial,
                                                    sans-serif;
                                                  font-size: 20px;
                                                  font-weight: 700;
                                                  line-height: 24px;
                                                  text-align: center;
                                                  color: #ffffff;
                                                "
                                              >
                                                Kode OTP
                                              </div>
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
                        <td
                          style="
                            font-size: 0px;
                            padding: 0px 25px;
                            word-break: break-word;
                          "
                        >
                          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->

                          <div
                            style="
                              background: #ffffff;
                              background-color: #ffffff;
                              margin: 0px auto;
                              border-radius: 0px 0px 16px 16px;
                              max-width: 560px;
                            "
                          >
                            <table
                              align="center"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="
                                background: #ffffff;
                                background-color: #ffffff;
                                width: 100%;
                                border-radius: 0px 0px 16px 16px;
                              "
                            >
                              <tbody>
                                <tr>
                                  <td
                                    style="
                                      direction: ltr;
                                      font-size: 0px;
                                      padding: 20px 25px;
                                      text-align: center;
                                    "
                                  >
                                    <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:510px;" ><![endif]-->

                                    <div
                                      class="mj-column-per-100 mj-outlook-group-fix"
                                      style="
                                        font-size: 0px;
                                        text-align: left;
                                        direction: ltr;
                                        display: inline-block;
                                        vertical-align: top;
                                        width: 100%;
                                      "
                                    >
                                      <table
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        role="presentation"
                                        style="vertical-align: top"
                                        width="100%"
                                      >
                                        <tbody>
                                          <tr>
                                            <td
                                              align="left"
                                              style="
                                                font-size: 0px;
                                                padding: 10px 25px;
                                                word-break: break-word;
                                              "
                                            >
                                              <div
                                                style="
                                                  font-family:
                                                    Ubuntu, Helvetica, Arial,
                                                    sans-serif;
                                                  font-size: 13px;
                                                  line-height: 24px;
                                                  text-align: left;
                                                  color: #003a6e;
                                                "
                                              >
                                                Halo <b>${nama}</b>, Berikut
                                                adalah kode OTP Anda
                                              </div>
                                            </td>
                                          </tr>

                                          <tr>
                                            <td
                                              align="left"
                                              style="
                                                font-size: 0px;
                                                padding: 10px 25px;
                                                word-break: break-word;
                                              "
                                            >
                                              <div
                                                style="
                                                  font-family:
                                                    Ubuntu, Helvetica, Arial,
                                                    sans-serif;
                                                  font-size: 13px;
                                                  font-weight: 500;
                                                  line-height: 24px;
                                                  text-align: left;
                                                  color: #003a6e;
                                                "
                                              >
                                                <div style="text-align: center">
                                                  Kode OTP:
                                                </div>
                                              </div>
                                            </td>
                                          </tr>

                                          <tr>
                                            <td
                                              style="
                                                font-size: 0px;
                                                padding: 10px;
                                                word-break: break-word;
                                              "
                                            >
                                              <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:510px;" width="510" bgcolor="#f5f5f5" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->

                                              <div
                                                style="
                                                  background: #f5f5f5;
                                                  background-color: #f5f5f5;
                                                  margin: 0px auto;
                                                  border-radius: 8px 8px 8px 8px;
                                                  max-width: 510px;
                                                "
                                              >
                                                <table
                                                  align="center"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  role="presentation"
                                                  style="
                                                    background: #f5f5f5;
                                                    background-color: #f5f5f5;
                                                    width: 100%;
                                                    border-radius: 8px 8px 8px
                                                      8px;
                                                  "
                                                >
                                                  <tbody>
                                                    <tr>
                                                      <td
                                                        style="
                                                          direction: ltr;
                                                          font-size: 0px;
                                                          padding: 10px;
                                                          text-align: center;
                                                        "
                                                      >
                                                        <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:490px;" ><![endif]-->

                                                        <div
                                                          class="mj-column-per-100 mj-outlook-group-fix"
                                                          style="
                                                            font-size: 0px;
                                                            text-align: left;
                                                            direction: ltr;
                                                            display: inline-block;
                                                            vertical-align: top;
                                                            width: 100%;
                                                          "
                                                        >
                                                          <table
                                                            border="0"
                                                            cellpadding="0"
                                                            cellspacing="0"
                                                            role="presentation"
                                                            style="
                                                              vertical-align: top;
                                                            "
                                                            width="100%"
                                                          >
                                                            <tbody>
                                                              <tr>
                                                                <td
                                                                  align="center"
                                                                  style="
                                                                    font-size: 0px;
                                                                    padding: 10px
                                                                      25px;
                                                                    word-break: break-word;
                                                                  "
                                                                >
                                                                  <div
                                                                    style="
                                                                      font-family:
                                                                        Ubuntu,
                                                                        Helvetica,
                                                                        Arial,
                                                                        sans-serif;
                                                                      font-size: 1.5rem;
                                                                      font-weight: 700;
                                                                      line-height: 24px;
                                                                      text-align: center;
                                                                      color: #003a6e;
                                                                    "
                                                                  >
                                                                    ${kode}
                                                                  </div>
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
                                            <td
                                              align="left"
                                              style="
                                                font-size: 0px;
                                                padding: 16px 0px 10px 0px;
                                                word-break: break-word;
                                              "
                                            >
                                              <div
                                                style="
                                                  font-family:
                                                    Ubuntu, Helvetica, Arial,
                                                    sans-serif;
                                                  font-size: 13px;
                                                  line-height: 24px;
                                                  text-align: left;
                                                  color: #003a6e;
                                                "
                                              >
                                                <div
                                                  style="text-align: justify"
                                                >
                                                  Gunakan kode OTP ini untuk
                                                  melakukan registrasi akun 
                                                  Anda. Kode OTP ini akan
                                                  kadaluwarsa dalam<b>
                                                    15 menit</b
                                                  >.
                                                </div>
                                              </div>
                                            </td>
                                          </tr>

                                          <tr>
                                            <td
                                              align="center"
                                              style="
                                                font-size: 0px;
                                                padding: 20px 0;
                                                word-break: break-word;
                                              "
                                            >
                                              <p
                                                style="
                                                  border-top: solid 1px #e9e9e9;
                                                  font-size: 1px;
                                                  margin: 0px auto;
                                                  width: 100%;
                                                "
                                              ></p>

                                              <!--[if mso | IE
                                                ]><table
                                                  align="center"
                                                  border="0"
                                                  cellpadding="0"
                                                  cellspacing="0"
                                                  style="
                                                    border-top: solid 1px
                                                      #e9e9e9;
                                                    font-size: 1px;
                                                    margin: 0px auto;
                                                    width: 510px;
                                                  "
                                                  role="presentation"
                                                  width="510px"
                                                >
                                                  <tr>
                                                    <td
                                                      style="
                                                        height: 0;
                                                        line-height: 0;
                                                      "
                                                    >
                                                      &nbsp;
                                                    </td>
                                                  </tr>
                                                </table><!
                                              [endif]-->
                                            </td>
                                          </tr>

                                          <tr>
                                            <td
                                              align="left"
                                              style="
                                                font-size: 0px;
                                                padding: 10px 0px 10px 0px;
                                                word-break: break-word;
                                              "
                                            >
                                              <div
                                                style="
                                                  font-family:
                                                    Ubuntu, Helvetica, Arial,
                                                    sans-serif;
                                                  font-size: 13px;
                                                  line-height: 24px;
                                                  text-align: left;
                                                  color: #8898aa;
                                                "
                                              >
                                                <p>
                                                  Jika Anda merasa tidak
                                                  melakukan permintaan<em>
                                                    registrasi akun</em
                                                  > , silakan abaikan email ini
                                                  atau hubungi administrator.
                                                </p>
                                              </div>
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
        style="
          background: initial;
          background-color: initial;
          margin: 0px auto;
          border-radius: 0px 0px 16px 16px;
          max-width: 600px;
        "
      >
        <table
          align="center"
          border="0"
          cellpadding="0"
          cellspacing="0"
          role="presentation"
          style="
            background: initial;
            background-color: initial;
            width: 100%;
            border-radius: 0px 0px 16px 16px;
          "
        >
          <tbody>
            <tr>
              <td
                style="
                  direction: ltr;
                  font-size: 0px;
                  padding: 20px 0;
                  text-align: center;
                "
              >
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->

                <div
                  class="mj-column-per-100 mj-outlook-group-fix"
                  style="
                    font-size: 0px;
                    text-align: left;
                    direction: ltr;
                    display: inline-block;
                    vertical-align: top;
                    width: 100%;
                  "
                >
                  <table
                    border="0"
                    cellpadding="0"
                    cellspacing="0"
                    role="presentation"
                    style="vertical-align: top"
                    width="100%"
                  >
                    <tbody>
                      <tr>
                        <td
                          align="center"
                          style="
                            font-size: 0px;
                            padding: 10px 25px;
                            word-break: break-word;
                          "
                        >
                          <div
                            style="
                              font-family: Ubuntu, Helvetica, Arial, sans-serif;
                              font-size: 13px;
                              line-height: 24px;
                              text-align: center;
                              color: #8898aa;
                            "
                          >
                            © 2025 Bantuan Orang Tua Asuh - IOM ITB.
                          </div>
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
</html>
`;
}
