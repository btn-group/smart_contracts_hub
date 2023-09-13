import "./src/jquery";
import "bootstrap";
import "./src/lodash";
import "./src/toastr";

// === CUSTOM ===
import "./src/polkadotjs";
import "./src/aleph_zero/helpers";
import "./src/aleph_zero/metadata/new";

export const HELPERS = {
  buttons: {
    disable: function (selector: string) {
      let $button = $(selector);
      $button.prop("disabled", true);
      $button.find(".loading").removeClass("d-none");
      $button.find(".ready").addClass("d-none");
    },
    enable: function (selector: string) {
      let $button = $(selector);
      $button.prop("disabled", false);
      $button.find(".loading").addClass("d-none");
      $button.find(".ready").removeClass("d-none");
    },
  },
  cookies: {
    get: (id: string): string | undefined => {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${id}=`))
        ?.split("=")[1];
    },
  },
  walletCloudinaryPublicId: function (id: string): string {
    switch (id) {
      case "keplr":
        return "logos/b8thbiihwftyjolgjjz2_dhy5mr";
      case "polkadot-js":
        return "logos/download_qbpd9p";
      case "subwallet-js":
        return "logos/subwallet.3be275bc71284f30e5bc_cwag5o";
      case "talisman":
        return "logos/Talisman-Icon-Red_e75eas.png";
      default:
        return "external-content.duckduckgo-1_memqe7";
    }
  },
  setUserAccountMenuToggle: (
    parentSelector: string,
    address: string,
    name: string,
    source: string
  ) => {
    $(`${parentSelector} img.user-address-alias-avatar`).attr(
      "src",
      `https://res.cloudinary.com/hv5cxagki/image/upload/c_scale,dpr_2,f_auto,h_25,q_100/${HELPERS.walletCloudinaryPublicId(
        source
      )}`
    );
    $(`${parentSelector} .account-name`).text(name);
    $(`${parentSelector} .account-address-abbreviated`).text(
      `${address.substring(0, 3)}...${address.slice(-3)}`
    );
  },
};