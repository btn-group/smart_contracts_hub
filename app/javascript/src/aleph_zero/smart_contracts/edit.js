import { DirectUpload } from "@rails/activestorage";
import Dropzone from "dropzone";
import { HELPERS } from "../../../application";
import { ALEPH_ZERO } from "../helpers";
import { POLKADOTJS } from "../../polkadotjs";

const SMART_CONTRACTS_EDIT = {
  smartContract: undefined,
  init: async () => {
    SMART_CONTRACTS_EDIT.addListeners();
    // GET SMART CONTRACT
    await SMART_CONTRACTS_EDIT.getAndSetContract();
    // === DROPZONE ===
    SMART_CONTRACTS_EDIT.createDropZones();
    SMART_CONTRACTS_EDIT.fillForm();
    await ALEPH_ZERO.activatePolkadotJsExtension();
  },
  addListeners: () => {
    $(document).on("aleph_zero_account_selected", async () => {
      await SMART_CONTRACTS_EDIT.validateAuthorisedToEdit();
      SMART_CONTRACTS_EDIT.getAndSetGroups();
      SMART_CONTRACTS_EDIT.getAndSetAzeroIds();
    });

    // === FORMS ===
    // pub fn create(
    //     &mut self,
    //     smart_contract_address: AccountId,
    //     chain: u8,
    //     azero_id: String,
    //     abi_url: String,
    //     contract_url: Option<String>,
    //     wasm_url: Option<String>,
    //     audit_url: Option<String>,
    //     group_id: Option<u32>,
    //     project_name: Option<String>,
    //     project_website: Option<String>,
    //     github: Option<String>,
    // ) -> Result<SmartContract> {
    // document.smartContractNewForm.onsubmit = async (e) => {
    //   e.preventDefault();
    //   let buttonSelector =
    //     "[name='smartContractNewForm'] button[type='submit']";
    //   document.disableButton(buttonSelector);
    //   try {
    //     let address =
    //       document.smartContractNewForm[
    //         "smart_contract[smart_contract_address]"
    //       ].value;
    //     let chain =
    //       document.smartContractNewForm["smart_contract[chain]"].value;
    //     let azeroId =
    //       document.smartContractNewForm["smart_contract[azero_id]"].value;
    //     let abiUrl =
    //       document.smartContractNewForm["smart_contract[abi_url]"].value;
    //     let contractUrl =
    //       document.smartContractNewForm["smart_contract[contract_url]"].value;
    //     let wasmUrl =
    //       document.smartContractNewForm["smart_contract[wasm_url]"].value;
    //     let auditUrl =
    //       document.smartContractNewForm["smart_contract[audit_url]"].value;
    //     let groupId =
    //       document.smartContractNewForm["smart_contract[group_id]"].value;
    //     let projectName =
    //       document.smartContractNewForm["smart_contract[project_name]"].value;
    //     let projectWebsite =
    //       document.smartContractNewForm["smart_contract[project_website]"]
    //         .value;
    //     let github =
    //       document.smartContractNewForm["smart_contract[github]"].value;

    //     let api = await ALEPH_ZERO.api();
    //     let account = ALEPH_ZERO.account;
    //     api.setSigner(ALEPH_ZERO.getSigner());
    //     const contract = await ALEPH_ZERO.contracts[
    //       "smartContractHub"
    //     ].getContract();
    //     await POLKADOTJS.contractTx(
    //       api,
    //       account.address,
    //       contract,
    //       "create",
    //       { value: 1_000_000_000_000 },
    //       [
    //         address,
    //         chain,
    //         azeroId,
    //         abiUrl,
    //         contractUrl,
    //         wasmUrl,
    //         auditUrl,
    //         groupId,
    //         projectName,
    //         projectWebsite,
    //         github,
    //       ]
    //     );
    //     document.showAlertSuccess("Success", true);
    //     // reset
    //     document.smartContractNewForm[
    //       "smart_contract[smart_contract_address]"
    //     ].value = "";
    //     document.smartContractNewForm["smart_contract[azero_id]"].value = "";
    //     Dropzone.forElement("#abi-dropzone").removeAllFiles(true);
    //     Dropzone.forElement("#contract-dropzone").removeAllFiles(true);
    //     Dropzone.forElement("#wasm-dropzone").removeAllFiles(true);
    //     Dropzone.forElement("#audit-dropzone").removeAllFiles(true);
    //     document.smartContractNewForm["smart_contract[project_name]"].value =
    //       "";
    //     document.smartContractNewForm["smart_contract[project_website]"].value =
    //       "";
    //     document.smartContractNewForm["smart_contract[github]"].value = "";
    //   } catch (err) {
    //     document.showAlertDanger(err);
    //   } finally {
    //     document.enableButton(buttonSelector);
    //   }
    // };
  },
  createDropZones: function () {
    let url = $("#smart_contract_audit").attr("data-direct-upload-url");
    let headers = {
      "X-CSRF-Token": $(
        "form#new_smart_contract input[name=authenticity_token]"
      ).val(),
    };
    [
      ["#audit-dropzone", "application/pdf", "#smart_contract_audit_url", 2.5],
    ].forEach(function (dzParams) {
      let dropZone = new Dropzone(dzParams[0], {
        url,
        headers,
        maxFiles: 1,
        maxFilesize: dzParams[3],
        acceptedFiles: dzParams[1],
        addRemoveLinks: true,
        autoQueue: false,
        dictDefaultMessage: "Drop file here to upload",
        init: function () {
          let myDropzone = this;
          let auditUrl = SMART_CONTRACTS_EDIT.smartContract.auditUrl;
          if (auditUrl.length) {
            let fileDetails = {
              id: "fileOnServer",
              name: undefined,
              size: 12345,
              imageUrl: undefined,
              accepted: true,
            };
            if (auditUrl.split("/smart-contract-hub-development/")[1].length) {
              fileDetails.name = auditUrl.split(
                "/smart-contract-hub-development/"
              )[1];
            } else if (
              auditUrl.split("/smart-contract-hub-production/")[1].length
            ) {
              fileDetails.name = auditUrl.split(
                "/smart-contract-hub-production/"
              )[1];
            }
            myDropzone.files.push(fileDetails);
            myDropzone.options.addedfile.call(myDropzone, fileDetails);
            // myDropzone.options.thumbnail.call(myDropzone, fileDetails, "/images/"+value.name);
            myDropzone.options.complete.call(myDropzone, fileDetails);
            myDropzone.options.success.call(myDropzone, fileDetails);
          }
        },
      });
      // This if you don't want the exceeded file shown at all
      dropZone.on("maxfilesexceeded", function (file) {
        dropZone.removeFile(file);
      });
      // Doesn't get called on showing file on server
      // This gets called even when maxfilesexceeded
      // manually check the number of accepted files before uploading
      dropZone.on("addedfile", function (file) {
        if (dropZone.getAcceptedFiles().length == 0) {
          const upload = new DirectUpload(file, url);
          upload.create((error, blob) => {
            if (error) {
              document.showAlertDanger(error);
              dropZone.removeFile(file);
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
        }
      });
      dropZone.on("removedfile", function (file) {
        $(dzParams[2]).val(undefined);
      });
    });
  },
  fillForm: () => {
    document.smartContractEditForm[
      "smart_contract[smart_contract_address]"
    ].value = SMART_CONTRACTS_EDIT.smartContract.smartContractAddress;
    document.smartContractEditForm["smart_contract[project_name]"].value =
      SMART_CONTRACTS_EDIT.smartContract.projectName;
    document.smartContractEditForm["smart_contract[project_website]"].value =
      SMART_CONTRACTS_EDIT.smartContract.projectWebsite;
    document.smartContractEditForm["smart_contract[github]"].value =
      SMART_CONTRACTS_EDIT.smartContract.github;
    document.smartContractEditForm["smart_contract[audit_url]"].value =
      SMART_CONTRACTS_EDIT.smartContract.auditUrl;
    $("#smart_contract_enabled").prop(
      "checked",
      SMART_CONTRACTS_EDIT.smartContract.enabled
    );
  },
  getAndSetContract: async () => {
    try {
      let id = Number(
        document.smartContractEditForm["smart_contract[id]"].value
      );
      const contract = await ALEPH_ZERO.contracts[
        "smartContractHub"
      ].getContract();
      let api = await ALEPH_ZERO.api();
      let response = await POLKADOTJS.contractQuery(
        api,
        ALEPH_ZERO.b3,
        contract,
        "show",
        undefined,
        [id]
      );
      document.response = response;
      if (response.output.asOk.isErr) {
        HELPERS.toastr.message = "Smart contract not found";
        HELPERS.toastr.alertType = document.showAlertDanger;
        Turbo.visit("/");
      } else {
        SMART_CONTRACTS_EDIT.smartContract =
          response.output.asOk.asOk.toHuman();
      }
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
  getAndSetAzeroIds: async () => {
    await ALEPH_ZERO.contracts.azeroIdRouter.getAndSetDomains();
    let $selectBox = $("select[name='smart_contract[azero_id]']");
    $selectBox.html("");
    ALEPH_ZERO.contracts.azeroIdRouter.domains.forEach(function (domain) {
      $selectBox.append(
        $("<option>", {
          value: domain,
          text: domain,
          selected: domain == SMART_CONTRACTS_EDIT.smartContract.azeroId,
        })
      );
    });
  },
  getAndSetGroups: async () => {
    // set groups select box
    let $selectBox = $("select[name='smart_contract[group_id]']");
    $selectBox.html("");
    $selectBox.append(
      $("<option>", {
        value: undefined,
        text: "",
      })
    );
    let groupUsers = await ALEPH_ZERO.subsquid.groupUsers();
    groupUsers.forEach(function (groupUser) {
      $selectBox.append(
        $("<option>", {
          value: groupUser.group.id,
          selected:
            Number(groupUser.group.id) ==
            Number(SMART_CONTRACTS_EDIT.smartContract.groupId),
          text: groupUser.group.name,
        })
      );
    });
  },
  validateAuthorisedToEdit: async () => {
    try {
      if (
        SMART_CONTRACTS_EDIT.smartContract.caller != ALEPH_ZERO.account.address
      ) {
        HELPERS.toastr.message = "Unauthorised";
        HELPERS.toastr.alertType = document.showAlertDanger;
        Turbo.visit("/");
      }
    } catch (err) {
      document.showAlertDanger(err);
    }
  },
};

// Even with turbo, init is called every time as listeners need to be replaced
$(document).on("turbo:load", function () {
  if ($("#smart-contracts-edit").length) {
    SMART_CONTRACTS_EDIT.init();
  }
});