// eslint-disable-next-line no-use-before-define
import React, { useEffect, useRef, useState } from 'react'
import * as remixLib from '@remix-project/remix-lib'
import { ContractGUIProps } from '../types'
import { CopyToClipboard } from '@remix-ui/clipboard'

const txFormat = remixLib.execution.txFormat
export function ContractGUI (props: ContractGUIProps) {
  const [title, setTitle] = useState<string>('')
  const [basicInput, setBasicInput] = useState<string>('')
  const [toggleContainer, setToggleContainer] = useState<boolean>(false)
  const [buttonOptions, setButtonOptions] = useState<{
    title: string,
    content: string,
    classList: string,
    dataId: string
  }>({ title: '', content: '', classList: '', dataId: '' })
  const [toggleDeployProxy, setToggleDeployProxy] = useState<boolean>(false)
  const [toggleUpgradeImp, setToggleUpgradeImp] = useState<boolean>(false)
  const [deployState, setDeployState] = useState<{ deploy: boolean, upgrade: boolean }>({ deploy: false, upgrade: false })
  const [useLastProxy, setUseLastProxy] = useState<boolean>(false)
  const [proxyAddress, setProxyAddress] = useState<string>('')
  const multiFields = useRef<Array<HTMLInputElement | null>>([])
  const initializeFields = useRef<Array<HTMLInputElement | null>>([])
  const basicInputRef = useRef<HTMLInputElement>()

  useEffect(() => {
    if (props.deployOption && Array.isArray(props.deployOption)) {
      if (props.deployOption[0] && props.deployOption[0].title === 'Deploy with Proxy' && props.deployOption[0].active) handleDeployProxySelect(true)
      else if (props.deployOption[1] && props.deployOption[1].title === 'Upgrade with Proxy' && props.deployOption[1].active)  handleUpgradeImpSelect(true)
    }
  }, [props.deployOption])

  useEffect(() => {
    if (props.title) {
      setTitle(props.title)
    } else if (props.funcABI.name) {
      setTitle(props.funcABI.name)
    } else {
      setTitle(props.funcABI.type === 'receive' ? '(receive)' : '(fallback)')
    }
    setBasicInput('')
    // we have the reset the fields before reseting the previous references.
    basicInputRef.current.value = ''
    multiFields.current.filter((el) => el !== null && el !== undefined).forEach((el) => el.value = '')
    multiFields.current = []
  }, [props.title, props.funcABI])

  useEffect(() => {
    if (props.lookupOnly) {
    //   // call. stateMutability is either pure or view
      setButtonOptions({
        title: title + ' - call',
        content: 'call',
        classList: 'btn-info',
        dataId: title + ' - call'
      })
    } else if (props.funcABI.stateMutability === 'payable' || props.funcABI.payable) {
    //   // transact. stateMutability = payable
      setButtonOptions({
        title: title + ' - transact (payable)',
        content: 'transact',
        classList: 'btn-danger',
        dataId: title + ' - transact (payable)'
      })
    } else {
    //   // transact. stateMutability = nonpayable
      setButtonOptions({
        title: title + ' - transact (not payable)',
        content: 'transact',
        classList: 'btn-warning',
        dataId: title + ' - transact (not payable)'
      })
    }
  }, [props.lookupOnly, props.funcABI, title])

  const getContentOnCTC = () => {
    const multiString = getMultiValsString(multiFields.current)
    // copy-to-clipboard icon is only visible for method requiring input params
    if (!multiString) {
      return 'cannot encode empty arguments'
    }
    const multiJSON = JSON.parse('[' + multiString + ']')

    const encodeObj = txFormat.encodeData(
        props.funcABI,
        multiJSON,
        props.funcABI.type === 'constructor' ? props.evmBC : null)

    if (encodeObj.error) {
      console.error(encodeObj.error)
      return encodeObj.error
    } else {
      return encodeObj.data
    }
  }

  const switchMethodViewOn = () => {
    setToggleContainer(true)
    makeMultiVal()
  }

  const switchMethodViewOff = () => {
    setToggleContainer(false)
    const multiValString = getMultiValsString(multiFields.current)

    if (multiValString) setBasicInput(multiValString)
  }

  const getMultiValsString = (fields: HTMLInputElement[]) => {
    const valArray = fields
    let ret = ''
    const valArrayTest = []

    for (let j = 0; j < valArray.length; j++) {
      if (ret !== '') ret += ','
      let elVal = valArray[j] ? valArray[j].value : ''

      valArrayTest.push(elVal)
      elVal = elVal.replace(/(^|,\s+|,)(\d+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted number by quoted number
      elVal = elVal.replace(/(^|,\s+|,)(0[xX][0-9a-fA-F]+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted hex string by quoted hex string
      if (elVal) {
        try {
          JSON.parse(elVal)
        } catch (e) {
          elVal = '"' + elVal + '"'
        }
      }
      ret += elVal
    }
    const valStringTest = valArrayTest.join('')

    if (valStringTest) {
      return ret
    } else {
      return ''
    }
  }

  const makeMultiVal = () => {
    let inputString = basicInput

    if (inputString) {
      inputString = inputString.replace(/(^|,\s+|,)(\d+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted number by quoted number
      inputString = inputString.replace(/(^|,\s+|,)(0[xX][0-9a-fA-F]+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted hex string by quoted hex string
      const inputJSON = JSON.parse('[' + inputString + ']')
      const multiInputs = multiFields.current

      for (let k = 0; k < multiInputs.length; k++) {
        if (inputJSON[k]) {
          multiInputs[k].value = JSON.stringify(inputJSON[k])
        }
      }
    }
  }

  const handleActionClick = () => {
    if (deployState.deploy) {
      const proxyInitializeString = getMultiValsString(initializeFields.current)

      props.clickCallBack(props.initializerOptions.inputs.inputs, proxyInitializeString, ['Deploy with Proxy'])
    } else if (deployState.upgrade) {
      props.clickCallBack(props.funcABI.inputs, proxyAddress, ['Upgrade with Proxy'])
    } else {
      props.clickCallBack(props.funcABI.inputs, basicInput)
    }
  }

  const handleBasicInput = (e) => {
    const value = e.target.value

    setBasicInput(value)
  }

  const handleExpandMultiClick = () => {
    const valsString = getMultiValsString(multiFields.current)

    if (valsString) {
      props.clickCallBack(props.funcABI.inputs, valsString)
    } else {
      props.clickCallBack(props.funcABI.inputs, '')
    }
  }

  const handleToggleDeployProxy = () => {
    setToggleDeployProxy(!toggleDeployProxy)
  }

  const handleDeployProxySelect = (value: boolean) => {
    if (value) setToggleUpgradeImp(false)
    setToggleDeployProxy(value)
    setDeployState({ upgrade: false, deploy: value })
  }

  const handleToggleUpgradeImp = () => {
    setToggleUpgradeImp(!toggleUpgradeImp)
  }

  const handleUpgradeImpSelect = (value: boolean) => {
    setToggleUpgradeImp(value)
    if (value) {
      setToggleDeployProxy(false)
      if (useLastProxy) setProxyAddress(props.savedProxyAddress)
    }
    setDeployState({ deploy: false, upgrade: value })
  }

  const handleUseLastProxySelect = (e) => {
    const value = e.target.checked
    const address = props.savedProxyAddress

    setUseLastProxy(value)
    setProxyAddress(address || '')
  }

  const handleSetProxyAddress = (e) => {
    const value = e.target.value

    setProxyAddress(value)
  }

  return (
    <div className={`udapp_contractProperty ${(props.funcABI.inputs && props.funcABI.inputs.length > 0) || (props.funcABI.type === 'fallback') || (props.funcABI.type === 'receive') ? 'udapp_hasArgs' : ''}`}>
      <div className="udapp_contractActionsContainerSingle pt-2" style={{ display: toggleContainer ? 'none' : 'flex' }}>
        <button onClick={handleActionClick} title={buttonOptions.title} className={`udapp_instanceButton ${props.widthClass} btn btn-sm ${buttonOptions.classList}`} data-id={buttonOptions.dataId}>{title}</button>
        <input
          className="form-control"
          data-id={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : 'multiParamManagerBasicInputField'}
          placeholder={props.inputs}
          title={props.funcABI.type === 'fallback' || props.funcABI.type === 'receive' ? `'(${props.funcABI.type}')` : props.inputs}
          onChange={handleBasicInput}
          ref={basicInputRef}
          style={{ visibility: !((props.funcABI.inputs && props.funcABI.inputs.length > 0) || (props.funcABI.type === 'fallback') || (props.funcABI.type === 'receive')) ? 'hidden' : 'visible' }} />
        <i
          className="fas fa-angle-down udapp_methCaret"
          onClick={switchMethodViewOn}
          title={title}
          style={{ visibility: !(props.funcABI.inputs && props.funcABI.inputs.length > 0) ? 'hidden' : 'visible' }}></i>
      </div>
      <div className="udapp_contractActionsContainerMulti" style={{ display: toggleContainer ? 'flex' : 'none' }}>
        <div className="udapp_contractActionsContainerMultiInner text-dark">
          <div onClick={switchMethodViewOff} className="udapp_multiHeader">
            <div className="udapp_multiTitle run-instance-multi-title">{title}</div>
            <i className='fas fa-angle-up udapp_methCaret'></i>
          </div>
          <div>
            {props.funcABI.inputs.map((inp, index) => {
              return (
                <div className="udapp_multiArg" key={index}>
                  <label htmlFor={inp.name}> {inp.name}: </label>
                  <input ref={el => { multiFields.current[index] = el }} className="form-control" placeholder={inp.type} title={inp.name} data-id={`multiParamManagerInput${inp.name}`} />
                </div>)
            })}
          </div>
          <div className="udapp_group udapp_multiArg">
            <CopyToClipboard tip='Encode values of input fields & copy to clipboard' icon='fa-clipboard' direction={'bottom'} getContent={getContentOnCTC} />
            <button onClick={handleExpandMultiClick} title={buttonOptions.title} data-id={buttonOptions.dataId} className={`udapp_instanceButton ${buttonOptions.classList}`}>{ buttonOptions.content }</button>
          </div>
        </div>
      </div>
      { props.deployOption && (props.deployOption || []).length > 0 ?
        <>
          <div className='d-flex justify-content-between'>
            <div className="d-flex py-1 align-items-center custom-control custom-checkbox">
              <input
                id="deployWithProxy"
                data-id="contractGUIDeployWithProxy"
                className="form-check-input custom-control-input"
                type="checkbox"
                onChange={(e) => handleDeployProxySelect(e.target.checked)}
                checked={deployState.deploy}
              />
              <label
                htmlFor="deployWithProxy"
                data-id="contractGUIDeployWithProxyLabel"
                className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
                title="An ERC1967 proxy contract will be deployed along with the selected implementation contract."
              >
                Deploy with Proxy
              </label>
            </div>
            <div>
              {
                props.initializerOptions && props.initializerOptions.initializeInputs ? 
                <span onClick={handleToggleDeployProxy}>
                  <i className={!toggleDeployProxy ? 'fas fa-angle-right pt-2' : 'fas fa-angle-down'} aria-hidden="true"></i>
                </span> : null
              }
            </div>
          </div>
            {
              props.initializerOptions && props.initializerOptions.initializeInputs ?
                <div className={`pl-4 flex-column ${toggleDeployProxy ? "d-flex" : "d-none"}`}>
                  <div className={`flex-column 'd-flex'}`}>{
                    props.initializerOptions.inputs.inputs.map((inp, index) => {
                      return (
                        <div className="mb-2" key={index}>
                          <label className='mt-2 text-left d-block' htmlFor={inp.name}> {inp.name}: </label>
                          <input ref={el => { initializeFields.current[index] = el }} style={{ height: 32 }} className="form-control udapp_input" placeholder={inp.type} title={inp.name} />
                        </div>
                      )})
                    }
                  </div>
                </div> : null
            }
          <div className='d-flex justify-content-between'>
            <div className="d-flex py-1 align-items-center custom-control custom-checkbox">
              <input
                id="upgradeImplementation"
                data-id="contractGUIUpgradeImplementation"
                className="form-check-input custom-control-input"
                type="checkbox"
                onChange={(e) => handleUpgradeImpSelect(e.target.checked)}
                checked={deployState.upgrade}
              />
              <label
                htmlFor="upgradeImplementation"
                data-id="contractGUIUpgradeImplementationLabel"
                className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
                title="The implementation contract will be deployed and then the proxy contract will be updated with new implementation's address."
              >
                Upgrade with Proxy
              </label>
            </div>
            <span onClick={handleToggleUpgradeImp}>
              <i className={!toggleUpgradeImp ? 'fas fa-angle-right pt-2' : 'fas fa-angle-down'} aria-hidden="true"></i>
            </span>
          </div>
          <div className={`pl-4 flex-column ${toggleUpgradeImp ? "d-flex" : "d-none"}`}>
            <div className={`flex-column 'd-flex'}`}>
              <div className="d-flex py-1 align-items-center custom-control custom-checkbox">
                <input
                  id="proxyAddress"
                  data-id="contractGUIProxyAddress"
                  className="form-check-input custom-control-input"
                  type="checkbox"
                  onChange={handleUseLastProxySelect}
                  checked={useLastProxy}
                />
                <label
                  htmlFor="proxyAddress"
                  data-id="contractGUIProxyAddressLabel"
                  className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
                  title="Select this option to use the last deployed ERC1967 contract on the current network."
                  style={{ fontSize: 12 }}
                >
                  Use last deployed ERC1967 contract
                </label>
              </div>
              {
                !useLastProxy ?
                <div className="mb-2">
                  <label className='mt-2 text-left d-block'>Proxy Address: </label>
                  <input style={{ height: 32 }} className="form-control udapp_input" data-id="ERC1967AddressInput" placeholder='proxy address' title='Enter previously deployed proxy address on the selected network' onChange={handleSetProxyAddress} />
                </div> :
                <span className='text-capitalize' data-id="lastDeployedERC1967Address" style={{ fontSize: '.8em' }}>{ proxyAddress || 'No proxy address available' }</span>
              }
            </div>
          </div>
        </> : null
      }
    </div>
  )
}
