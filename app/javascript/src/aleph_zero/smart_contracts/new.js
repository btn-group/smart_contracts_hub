import { DirectUpload } from "@rails/activestorage";
import Dropzone from "dropzone";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const SMART_CONTRACTS_NEW = {
  init: async () => {
    SMART_CONTRACTS_NEW.addListeners();
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    $(document).on("aleph_zero_account_selected", async () => {
      await ALEPH_ZERO.contracts.azeroIdRouter.getAndSetDomains();
      let $selectBox = $("select[name=azeroId]");
      $selectBox.html("");
      ALEPH_ZERO.contracts.azeroIdRouter.domains.forEach(function (domain) {
        $selectBox.append(
          $("<option>", {
            value: domain,
            text: domain,
            selected:
              domain == ALEPH_ZERO.contracts.azeroIdRouter.primaryDomain,
          })
        );
      });
    });

    // === DROPZONE ===
    SMART_CONTRACTS_NEW.createDropZones();

    // === FORMS ===
    document.smartContractNewForm.onsubmit = async (e) => {
      e.preventDefault();
      let buttonSelector = "[name='smartContractNewForm'] button[type='submit']";
      document.disableButton(buttonSelector);
      try {
        let smartContractAddress = document.smartContractNewForm.smartContractAddress.value;
        let url = document.smartContractNewForm.url.value;
        let api = await ALEPH_ZERO.api();
        let account = ALEPH_ZERO.account;
        api.setSigner(ALEPH_ZERO.getSigner());
        const contract = await ALEPH_ZERO.contracts[
          "azSmartContractMetadataHub"
        ].getContract();
        await POLKADOTJS.contractTx(
          api,
          account.address,
          contract,
          "create",
          {},
          [smartContractAddress, url, 0]
        );
        document.smartContractNewForm.smartContractAddress.value = "";
        document.smartContractNewForm.url.value = "";
        document.showAlertSuccess("Success", true);
      } catch (err) {
        document.showAlertDanger(err);
      } finally {
        document.enableButton(buttonSelector);
      }
    };
  },
  createDropZones: function () {
    let url = $("#smart_contract_abi").attr("data-direct-upload-url");
    let headers = {
      "X-CSRF-Token": $(
        "form#new_smart_contract input[name=authenticity_token]"
      ).val(),
    };
    [
      ["#abi-dropzone", "application/json", "#smart_contract_abi_url"],
      ["#contract-dropzone", ".contract", "#smart_contract_contract_url"],
      ["#wasm-dropzone", "application/wasm", "#smart_contract_wasm_url"],
    ].forEach(function (dzParams) {
      let dropZone = new Dropzone(dzParams[0], {
        url,
        headers,
        maxFiles: 1,
        maxFilesize: 0.5,
        acceptedFiles: dzParams[1],
        addRemoveLinks: true,
        autoQueue: false,
      });
      dropZone.on("addedfile", function (file) {
        const upload = new DirectUpload(file, url);
        upload.create((error, blob) => {
          if (error) {
            document.showAlertDanger(error);
            return;
          } else {
            let url;
            if ($("body.rails-env-development").length) {
              url = `https://link.storjshare.io/jxilw2olwgoskdx2k4fvsswcfwfa/smart-contract-hub-development/${blob.key}`;
            } else {
              url = `https://link.storjshare.io/juldos5d7qtuwqx2itvdhgtgp3vq/smart-contract-hub-production/${blob.key}`;
            }
            $(dzParams[2]).val(url);
          }
        });
      });
    });
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-new").length) {
    SMART_CONTRACTS_NEW.init();
  }
});
