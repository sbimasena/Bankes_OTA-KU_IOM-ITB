export function deadlineTransaksiEmail(
  besar_tagihan: number,
  tanggal: string,
  sisa_hari: number,
  linkBayar: string,  // Link bayar itu ke page status transaksi
) {
  return `<body style="box-sizing: border-box; margin: 0; margin-top: 0px; margin-right: 0px; margin-bottom: 0px; margin-left: 0px; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px; text-size-adjust: 100%;">
  <title>
  </title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <div id="iwspw" style="box-sizing: border-box; background-color: #f6f9fc;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div id="i9poj" style="box-sizing: border-box; background: initial; background-color: initial; margin: 0px auto; max-width: 600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="iw3jy" style="box-sizing: border-box; border-collapse: collapse; background: initial; background-color: initial; width: 100%;" width="100%" bgcolor="initial">
        <tbody style="box-sizing: border-box;">
          <tr style="box-sizing: border-box;">
            <td id="i3y78" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 0px; text-align: center;" align="center">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="initial" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div id="i0pvt" style="box-sizing: border-box; background: initial; background-color: initial; margin: 0px auto; max-width: 600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="ix72c" style="box-sizing: border-box; border-collapse: collapse; background: initial; background-color: initial; width: 100%;" width="100%" bgcolor="initial">
        <tbody style="box-sizing: border-box;">
          <tr style="box-sizing: border-box;">
            <td id="i94v4" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 0 20px; text-align: center;" align="center">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="shadow-outlook" style="vertical-align:top;width:560px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix shadow" id="iurys" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="ihr8b" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;" valign="top">
                  <tbody style="box-sizing: border-box;">
                    <tr style="box-sizing: border-box;">
                      <td id="io8ng" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 25px 25px 0px 25px; word-break: break-word;">
                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#003399" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                        <div id="ixuah" style="box-sizing: border-box; background: #003399; background-color: #003399; margin: 0px auto; border-radius: 24px 24px 0px 0px; max-width: 560px;">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="i45wl" style="box-sizing: border-box; border-collapse: collapse; background: #003399; background-color: #003399; width: 100%; border-radius: 24px 24px 0px 0px;" width="100%" bgcolor="#003399">
                            <tbody style="box-sizing: border-box;">
                              <tr style="box-sizing: border-box;">
                                <td id="ij7x7" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 20px; text-align: center;" align="center">
                                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:520px;" ><![endif]-->
                                  <div class="mj-column-per-100 mj-outlook-group-fix" id="iqs9p" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="i2gr5" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;" valign="top">
                                      <tbody style="box-sizing: border-box;">
                                        <tr style="box-sizing: border-box;">
                                          <td align="center" id="ijaxa" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 25px; word-break: break-word;">
                                            <div id="i43nm" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 700; line-height: 24px; text-align: center; color: #ffffff;">
                                              Notifikasi Tenggat Waktu Pembayaran
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
                    <tr style="box-sizing: border-box;">
                      <td id="ihm1d" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 0px 25px; word-break: break-word;">
                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                        <div id="i7ibt" style="box-sizing: border-box; background: #FFFFFF; background-color: #FFFFFF; margin: 0px auto; border-radius: 0px 0px 16px 16px; max-width: 560px;">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="iamm6" style="box-sizing: border-box; border-collapse: collapse; background: #FFFFFF; background-color: #FFFFFF; width: 100%; border-radius: 0px 0px 16px 16px;" width="100%" bgcolor="#FFFFFF">
                            <tbody style="box-sizing: border-box;">
                              <tr style="box-sizing: border-box;">
                                <td id="iqs1t" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 20px 25px; text-align: center;" align="center">
                                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:510px;" ><![endif]-->
                                  <div class="mj-column-per-100 mj-outlook-group-fix" id="imv6v" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="irysw" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;" valign="top">
                                      <tbody style="box-sizing: border-box;">
                                        <tr style="box-sizing: border-box;">
                                          <td align="left" id="iwx3a" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 0px 10px 0px; word-break: break-word;">
                                            <div id="ik303" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 24px; text-align: left; color: #003A6E;">
                                              <div id="ibtb7" style="box-sizing: border-box; text-align: justify;">Menginformasikan untuk segera melakukan
                                                transaksi Bantuan Orang Tua Asuh sebesar 
                                                <b id="ithga" style="box-sizing: border-box;">${besar_tagihan}
                                                </b> terakhir
                                                pada 
                                                <b style="box-sizing: border-box;">${tanggal}.
                                                </b>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                        <tr style="box-sizing: border-box;">
                                          <td align="left" id="iwi5d" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 25px; word-break: break-word;">
                                            <div id="ijyyg" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 500; line-height: 24px; text-align: left; color: #003A6E;">
                                              <div id="i1n0d" style="box-sizing: border-box; text-align: center;">Tenggat Waktu Pembayaran
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                        <tr style="box-sizing: border-box;">
                                          <td id="i1msi" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px; word-break: break-word;">
                                            <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:510px;" width="510" bgcolor="#f5f5f5" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                                            <div id="i0z1f" style="box-sizing: border-box; background: #f5f5f5; background-color: #f5f5f5; margin: 0px auto; border-radius: 8px 8px 8px 8px; max-width: 510px;">
                                              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="i8wab" style="box-sizing: border-box; border-collapse: collapse; background: #f5f5f5; background-color: #f5f5f5; width: 100%; border-radius: 8px 8px 8px 8px;" width="100%" bgcolor="#f5f5f5">
                                                <tbody style="box-sizing: border-box;">
                                                  <tr style="box-sizing: border-box;">
                                                    <td id="i0rdx" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 10px; text-align: center;" align="center">
                                                      <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:490px;" ><![endif]-->
                                                      <div class="mj-column-per-100 mj-outlook-group-fix" id="iyyik" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="iu52t" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;" valign="top">
                                                          <tbody style="box-sizing: border-box;">
                                                            <tr style="box-sizing: border-box;">
                                                              <td align="center" id="i1ghh" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 25px; word-break: break-word;">
                                                                <div id="iv9mi" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 1.5rem; font-weight: 700; line-height: 24px; text-align: center; color: #003A6E;">
                                                                  ${tanggal}
                                                                </div>
                                                              </td>
                                                            </tr>
                                                            <tr style="box-sizing: border-box;">
                                                              <td align="center" id="ii1bi" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 25px; word-break: break-word;">
                                                                <div id="i7rwf" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 1rem; font-weight: 400; line-height: 24px; text-align: center; color: #003A6E;">
                                                                  ${sisa_hari} Hari Lagi
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
                                        <tr style="box-sizing: border-box;">
                                          <td align="left" id="ic3te" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 16px 0px 10px 0px; word-break: break-word;">
                                            <div id="i2w35" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 24px; text-align: left; color: #003A6E;">
                                            </div>
                                          </td>
                                        </tr>
                                        <tr style="box-sizing: border-box;">
                                          <td align="center" vertical-align="middle" id="i0vcpq" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 12px 30px; word-break: break-word;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" id="i3j9q2" style="box-sizing: border-box; border-collapse: separate; line-height: 100%;">
                                              <tbody style="box-sizing: border-box;">
                                                <tr style="box-sizing: border-box;">
                                                  <td align="center" bgcolor="#003399" role="presentation" valign="middle" id="iy20jz" style="box-sizing: border-box; border-collapse: collapse; border: none; border-radius: 4px; cursor: auto; mso-padding-alt: 10px 25px; background: #003399;">
                                                    <a href="${linkBayar}" target="_blank" id="i00qak" style="box-sizing: border-box; display: inline-block; background: #003399; color: #ffffff; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: normal; line-height: 120%; margin: 0; text-decoration: none; text-transform: none; padding: 10px 25px; mso-padding-alt: 0px; border-radius: 4px;">
                                                      Lakukan Pembayaran
                                                    </a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr style="box-sizing: border-box;">
                                          <td align="center" id="ipp11n" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 20px 0; word-break: break-word;">
                                            <p id="izv773" style="box-sizing: border-box; display: block; margin-top: 13px; margin-right: 0px; margin-bottom: 13px; margin-left: 0px; border-top: solid 1px #e9e9e9; font-size: 1px; margin: 0px auto; width: 100%;">
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
    <div id="ij5m7h" style="box-sizing: border-box; background: initial; background-color: initial; margin: 0px auto; border-radius: 0px 0px 16px 16px; max-width: 600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" id="i0ryhh" style="box-sizing: border-box; border-collapse: collapse; background: initial; background-color: initial; width: 100%; border-radius: 0px 0px 16px 16px;" width="100%" bgcolor="initial">
        <tbody style="box-sizing: border-box;">
          <tr style="box-sizing: border-box;">
            <td id="idjebs" style="box-sizing: border-box; border-collapse: collapse; direction: ltr; font-size: 0px; padding: 20px 0; text-align: center;" align="center">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" id="i8vo1j" style="box-sizing: border-box; font-size: 0px; text-align: left; direction: ltr; display: inline-block; vertical-align: top; width: 100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" id="io3g7j" style="box-sizing: border-box; border-collapse: collapse; vertical-align: top;" valign="top">
                  <tbody style="box-sizing: border-box;">
                    <tr style="box-sizing: border-box;">
                      <td align="center" id="iwyf0k" style="box-sizing: border-box; border-collapse: collapse; font-size: 0px; padding: 10px 25px; word-break: break-word;">
                        <div id="ip0me1" style="box-sizing: border-box; font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 24px; text-align: center; color: #8898aa;">
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
<style>
  @media only screen and (min-width: 480px) {
    .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }
  }
  @media only screen and (max-width: 479px) {
    table.mj-full-width-mobile {
      width: 100% !important;
    }
    td.mj-full-width-mobile {
      width: auto !important;
    }
  }
</style>`;
}
