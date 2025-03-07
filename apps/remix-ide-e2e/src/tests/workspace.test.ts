'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'
import sauce from './sauce'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done, 'http://127.0.0.1:8080?activate=solidity,udapp&call=fileManager//open//contracts/3_Ballot.sol&deactivate=home', false)
  },

  CheckSolidityActivatedAndUDapp: function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('#icon-panel', 10000)
      .clickLaunchIcon('solidity')
      .clickLaunchIcon('udapp')
  },

  'Editor should be focused on the 3_Ballot.sol #group1': function (browser: NightwatchBrowser) {
    browser
      .pause(5000)
      .refresh()
      .waitForElementVisible('#editorView', 30000)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf('contract Ballot {') !== -1, 'content includes Ballot contract')
      })
  },

  'Home page should be deactivated #group1': function (browser: NightwatchBrowser) {
    browser
      .waitForElementNotPresent('[data-id="landingPageHomeContainer"]')
  },

  // WORKSPACE TEMPLATES E2E START

  'Should create Remix default workspace with files': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('filePanel')
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_remix_default' })
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(1000)
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts/2_Owner.sol"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts/3_Ballot.sol"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .pause(2000)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemtests"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemtests/storage.test.js"]')
      .click('*[data-id="treeViewLitreeViewItemtests/storage.test.js"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`const { expect } = require("chai");`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemtests/Ballot_test.sol"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemREADME.txt"]')
  },

  'Should create blank workspace with no files': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_blank' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=blank]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .assert.elementPresent('*[data-id="treeViewUltreeViewMenu"]')
      .execute(function () {
        const fileList = document.querySelector('*[data-id="treeViewUltreeViewMenu"]')
        return fileList.getElementsByTagName('li').length;
      }, [], function(result){
          browser.assert.equal(result.value, 0, 'Incorrect number of files');
      });
  },

  'Should create ERC20 workspace with files': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_erc20' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc20]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts/SampleERC20.sol"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemtests"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemtests/SampleERC20_test.sol"]')
  },

  'Should create ERC721 workspace with files': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      // eslint-disable-next-line dot-notation
      .execute(function () { document.querySelector('*[data-id="modalDialogCustomPromptTextCreate"]')['value'] = 'workspace_erc721' })
      .click('select[id="wstemplate"]')
      .click('select[id="wstemplate"] option[value=ozerc721]')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .execute(function () { (document.querySelector('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok') as HTMLElement).click() })
      .pause(100)
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemcontracts/SampleERC721.sol"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      // check js and ts files are not transformed
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_web3.ts"]')
      
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './web3-lib'`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/deploy_with_ethers.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`import { deploy } from './ethers-lib'`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/web3-lib.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, from?: string, gas?: number): Promise<Options> => {`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .click('*[data-id="treeViewLitreeViewItemscripts/ethers-lib.ts"]')
      .pause(100)
      .getEditorValue((content) => {
        browser.assert.ok(content.indexOf(`export const deploy = async (contractName: string, args: Array<any>, accountIndex?: number): Promise<ethers.Contract> => {`) !== -1,
        'Incorrect content')
      })
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemtests"]')
      .assert.elementPresent('*[data-id="treeViewLitreeViewItemtests/SampleERC721_test.sol"]')
  },

  // WORKSPACE TEMPLATES E2E END

  'Should create two workspace and switch to the first one': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceCreate"]') // create workspace_name
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      .click('*[data-id="modalDialogCustomPromptTextCreate"]')
      .clearValue('*[data-id="modalDialogCustomPromptTextCreate"]')
      .setValue('*[data-id="modalDialogCustomPromptTextCreate"]', 'workspace_name')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .pause(1000)
      .addFile('test.sol', { content: 'test' })
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .click('*[data-id="workspaceCreate"]') // create workspace_name_1
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextCreate"]')
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] > button')
      .click('*[data-id="modalDialogCustomPromptTextCreate"]')
      .clearValue('*[data-id="modalDialogCustomPromptTextCreate"]')
      .setValue('*[data-id="modalDialogCustomPromptTextCreate"]', 'workspace_name_1')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')     
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .pause(2000)
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .pause(2000)
      .switchWorkspace('workspace_name')
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
  },

  'Should rename a workspace #group1': function (browser: NightwatchBrowser) {
    browser
      .click('*[data-id="workspaceRename"]') // rename workspace_name
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
      .waitForElementVisible('*[data-id="modalDialogCustomPromptTextRename"]')
      .click('*[data-id="modalDialogCustomPromptTextRename"]')
      .clearValue('*[data-id="modalDialogCustomPromptTextRename"]')
      .setValue('*[data-id="modalDialogCustomPromptTextRename"]', 'workspace_name_renamed')
      .waitForElementPresent('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .switchWorkspace('workspace_name_1')
      .pause(2000)
      .waitForElementNotPresent('*[data-id="treeViewLitreeViewItemtest.sol"]')
      .switchWorkspace('workspace_name_renamed')
      .pause(2000)
      .waitForElementVisible('*[data-id="treeViewLitreeViewItemtest.sol"]')
  },

  'Should delete a workspace #group1': function (browser: NightwatchBrowser) {
    browser
      .switchWorkspace('workspace_name_1')
      .click('*[data-id="workspaceDelete"]') // delete workspace_name_1
      .waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
      .waitForElementVisible('[data-id="workspacesSelect"]')
      .click('[data-id="workspacesSelect"]')
      .waitForElementNotPresent(`[data-id="dropdown-item-workspace_name_1"]`)
  },

    // CLONE REPOSITORY E2E START

    'Should clone a repository #group2': function (browser: NightwatchBrowser) {
      browser
        .waitForElementVisible('[data-id="cloneGitRepository"]')
        .click('[data-id="cloneGitRepository"]')
        .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
        .click('[data-id="fileSystemModalDialogModalBody-react"]')
        .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
        .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
        .click('[data-id="fileSystem-modal-footer-ok-react"]')
        .waitForElementPresent('.fa-spinner')
        .pause(5000)
        .waitForElementNotPresent('.fa-spinner')
        .waitForElementVisible('*[data-id="treeViewLitreeViewItem.git"]')
        .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix')
    },

    'Should display dgit icon for cloned workspace #group2': function (browser: NightwatchBrowser) {
      browser
        .switchWorkspace('default_workspace')
        .waitForElementNotVisible('[data-id="workspacesSelect"] .fa-code-branch')
        .switchWorkspace('awesome-remix')
        .waitForElementVisible('[data-id="workspacesSelect"] .fa-code-branch')
    },
    
    'Should display non-clashing names for duplicate clone #group2': '' + function (browser: NightwatchBrowser) {
      browser
        .waitForElementVisible('[data-id="cloneGitRepository"]')
        .click('[data-id="cloneGitRepository"]')
        .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
        .click('[data-id="fileSystemModalDialogModalBody-react"]')
        .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
        .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
        .click('[data-id="fileSystem-modal-footer-ok-react"]')
        .pause(5000)
        .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix1')
        .waitForElementVisible('[data-id="cloneGitRepository"]')
        .click('[data-id="cloneGitRepository"]')
        .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
        .click('[data-id="fileSystemModalDialogModalBody-react"]')
        .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
        .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
        .click('[data-id="fileSystem-modal-footer-ok-react"]')
        .pause(5000)
        .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix2')
        .waitForElementVisible('[data-id="cloneGitRepository"]')
        .click('[data-id="cloneGitRepository"]')
        .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
        .click('[data-id="fileSystemModalDialogModalBody-react"]')
        .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
        .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/awesome-remix')
        .click('[data-id="fileSystem-modal-footer-ok-react"]')
        .pause(5000)
        .waitForElementContainsText('[data-id="workspacesSelect"]', 'awesome-remix3')
        .switchWorkspace('awesome-remix')
        .switchWorkspace('awesome-remix1')
        .switchWorkspace('awesome-remix2')
        .switchWorkspace('awesome-remix3')
    },

    'Should display error message in modal for failed clone #group2': function (browser: NightwatchBrowser) {
      browser
        .waitForElementVisible('[data-id="cloneGitRepository"]')
        .click('[data-id="cloneGitRepository"]')
        .waitForElementVisible('[data-id="fileSystemModalDialogModalBody-react"]')
        .click('[data-id="fileSystemModalDialogModalBody-react"]')
        .waitForElementVisible('[data-id="modalDialogCustomPromptTextClone"]')
        .setValue('[data-id="modalDialogCustomPromptTextClone"]', 'https://github.com/ethereum/non-existent-repo')
        .click('[data-id="fileSystem-modal-footer-ok-react"]')
        .pause(5000)
        .waitForElementVisible('[data-id="cloneGitRepositoryModalDialogModalBody-react"]')
        .waitForElementContainsText('[data-id="cloneGitRepositoryModalDialogModalBody-react"]', 'An error occurred: Please check that you have the correct URL for the repo. If the repo is private, you need to add your github credentials (with the valid token permissions) in Settings plugin')
        .click('[data-id="cloneGitRepository-modal-footer-ok-react"]')
        .end()
    },

    // CLONE REPOSITORY E2E END

  tearDown: sauce
}
