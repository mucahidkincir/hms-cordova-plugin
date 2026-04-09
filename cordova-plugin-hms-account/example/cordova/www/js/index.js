/*
    Copyright 2020-2024. Huawei Technologies Co., Ltd. All rights reserved.

    Licensed under the Apache License, Version 2.0 (the "License")
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        https://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
var accessToken;

var ui = {
    badge: null,
    statusMessage: null,
    resultOutput: null,
    tokenState: null,
    bitmap: null,
    bitmapCaption: null
};

function cacheUiElements() {
    ui.badge = document.getElementById('status_badge');
    ui.statusMessage = document.getElementById('status_message');
    ui.resultOutput = document.getElementById('result_output');
    ui.tokenState = document.getElementById('token_state');
    ui.bitmap = document.getElementById('img_bitmap');
    ui.bitmapCaption = document.getElementById('img_caption');
}

function stringifyPayload(payload) {
    if (typeof payload === 'string') {
        return payload;
    }

    try {
        return JSON.stringify(payload, null, 2);
    } catch (err) {
        return String(payload);
    }
}

function setStatus(state, title, payload) {
    if (!ui.badge || !ui.statusMessage || !ui.resultOutput) {
        return;
    }

    ui.badge.className = 'status-chip' + (state ? ' ' + state : '');
    ui.badge.textContent = title;
    ui.statusMessage.textContent = typeof payload === 'string' ? payload : 'Last response updated below.';
    ui.resultOutput.textContent = stringifyPayload(payload);
}

function setTokenState(value) {
    if (!ui.tokenState) {
        return;
    }

    ui.tokenState.textContent = value || 'Not available';
}

function setBitmapPreview(bitmapData, description) {
    if (!ui.bitmap || !ui.bitmapCaption) {
        return;
    }

    if (bitmapData) {
        ui.bitmap.setAttribute('src', bitmapData);
        ui.bitmapCaption.textContent = description || 'Bitmap successfully rendered.';
        return;
    }

    ui.bitmap.setAttribute('src', '');
    ui.bitmapCaption.textContent = description || '`Get Channel` çağrısı sonrasında ikon burada gösterilir.';
}

function showSuccess(action, payload) {
    setStatus('success', action + ' success', payload);
    alert(action + ' -> success : ' + stringifyPayload(payload));
}

function showError(action, error) {
    setStatus('error', action + ' error', error);
    alert(action + ' -> Error : ' + stringifyPayload(error));
}

function bindClick(id, handler) {
    var element = document.getElementById(id);
    if (!element) {
        setStatus('error', 'Missing control', 'Element not found: ' + id);
        return;
    }

    element.addEventListener('click', handler);
}

var app = {

    initialize: function () {
        cacheUiElements();
        setStatus('', 'Waiting for device', 'Cordova `deviceready` olayi bekleniyor.');
        setTokenState('');
        setBitmapPreview('');
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function () {
        bindClick('btn_sign_in_with_id_token', signInWithIdToken);
        bindClick('btn_sign_in_with_authorization_code', signInAuthorizationCode);
        bindClick('btn_sign_out', signOut);
        bindClick('btn_cancel_authorization', cancelAuthorization);
        bindClick('btn_silent_sign_in', silentSignIn);
        bindClick('btn_huawei_id_auth_button', getHuaweiIdAuthButton);
        bindClick('btn_account_sign_in_with_id_token', accountSignInWithIdToken);
        bindClick('btn_account_sign_out', accountSignOut);
        bindClick('btn_account_cancel_authorization', accountCancelAuthorization);
        bindClick('btn_account_silent_sign_in', accountSilentSignIn);
        bindClick('btn_get_channel', getChannel);
        bindClick('btn_independent_sign_in', getIndependentSignIn);
        bindClick('btn_account_contain_scopes', containScopes);
        bindClick('btn_auth_result', getAuthResult);
        bindClick('btn_auth_result_with_scopes', getAuthResultWithScopes);
        bindClick('btn_add_auth_scopes', addAuthScopes);
        bindClick('btn_hwid_contain_scopes', hwidContainScopes);
        bindClick('btn_hwid_auth_result', hwidGetAuthResult);
        bindClick('btn_hwid_auth_result_with_scopes', hwidGetAuthResultWithScopes);
        bindClick('btn_hwid_add_auth_scopes', hwidAddAuthScopes);
        bindClick('btn_request_union_id', requestUnionId);
        bindClick('btn_request_access_token', requestAccessToken);
        bindClick('btn_delete_auth_info', deleteAuthInfo);
        bindClick('btn_build_network_url', buildNetworkUrl);
        bindClick('btn_build_network_cookie', buildNetworkCookie);
        bindClick('btn_start_consent', startConsent);
        bindClick('btn_sms_verification_code', smsVerificationCode);
        bindClick('btn_obtain_hash_code', obtainHashCode);
        setStatus('success', 'Device ready', 'Tum HMS butonlari kullanima hazir.');
    }

};

async function accountSignInWithIdToken() {
    var signInParameters = {
        authRequestOption: [
            HMSCommonTypes.AuthRequestOption.SCOPE_ID_TOKEN,
            HMSCommonTypes.AuthRequestOption.SCOPE_ACCESS_TOKEN,
            HMSCommonTypes.AuthRequestOption.SCOPE_CARRIER_ID
        ],
        authParam: HMSCommonTypes.AuthParams.DEFAULT_AUTH_REQUEST_PARAM,
        authIdTokenSignAlg: HMSCommonTypes.AuthIdTokenSignAlg.PS256
    };
    var packageName = HMSCommonTypes.PackageName.ACCOUNT;

    try {
        var res = await HMSAccountAuthService.signIn(signInParameters, packageName);
        accessToken = res.accessToken;
        setTokenState(accessToken);
        showSuccess('accountSignInWithIdToken', res);
    } catch (ex) {
        showError('accountSignInWithIdToken', ex);
    }
}

async function accountSignOut() {
    try {
        await HMSAccountAuthService.signOut();
        accessToken = null;
        setTokenState('');
        showSuccess('accountSignOut', 'Signed out.');
    } catch (ex) {
        showError('accountSignOut', ex);
    }
}

async function accountCancelAuthorization() {
    try {
        await HMSAccountAuthService.cancelAuthorization();
        showSuccess('accountCancelAuthorization', 'Authorization cancelled.');
    } catch (ex) {
        showError('accountCancelAuthorization', ex);
    }
}

async function accountSilentSignIn() {
    try {
        var authParam = HMSCommonTypes.AuthParams.DEFAULT_AUTH_REQUEST_PARAM;
        var packageName = HMSCommonTypes.PackageName.ACCOUNT;
        var res = await HMSAccountAuthService.silentSignIn(authParam, packageName);
        accessToken = res.accessToken || accessToken;
        setTokenState(accessToken);
        showSuccess('accountSilentSignIn', res);
    } catch (ex) {
        showError('accountSilentSignIn', ex);
    }
}

async function getChannel() {
    try {
        var res = await HMSAccountAuthService.getChannel();
        var bitmapData = 'data:image/png;base64,' + res.icon;
        setBitmapPreview(bitmapData, res.description || 'Channel icon rendered from HMS response.');
        showSuccess('getChannel', res);
    } catch (ex) {
        setBitmapPreview('', 'Channel icon could not be loaded.');
        showError('getChannel', ex);
    }
}

async function getIndependentSignIn() {
    try {
        var res = await HMSAccountAuthService.getIndependentSignIn(accessToken);
        showSuccess('getIndependentSignIn', res);
    } catch (ex) {
        showError('getIndependentSignIn', ex);
    }
}

async function signInWithIdToken() {
    var signInParameters = {
        authRequestOption: [
            HMSCommonTypes.AuthRequestOption.SCOPE_ID_TOKEN,
            HMSCommonTypes.AuthRequestOption.SCOPE_ACCESS_TOKEN
        ],
        authParam: HMSCommonTypes.AuthParams.DEFAULT_AUTH_REQUEST_PARAM
    };
    var packageName = HMSCommonTypes.PackageName.HWID;

    try {
        var res = await HMSAccount.signIn(signInParameters, packageName);
        accessToken = res.accessToken || accessToken;
        setTokenState(accessToken);
        showSuccess('signInWithIdToken', res);
    } catch (ex) {
        showError('signInWithIdToken', ex);
    }
}

async function signInAuthorizationCode() {
    var signInWithAuthCode = {
        authRequestOption: [HMSCommonTypes.AuthRequestOption.SCOPE_AUTHORIZATION_CODE],
        authParam: HMSCommonTypes.AuthParams.DEFAULT_AUTH_REQUEST_PARAM,
        authScopeList: [HMSCommonTypes.AuthScopeList.EMAIL, HMSCommonTypes.AuthScopeList.PROFILE]
    };
    var packageName = HMSCommonTypes.PackageName.HWID;

    try {
        var res = await HMSAccount.signIn(signInWithAuthCode, packageName);
        showSuccess('signInAuthorizationCode', res);
    } catch (ex) {
        showError('signInAuthorizationCode', ex);
    }
}

async function signOut() {
    try {
        await HMSAccount.signOut();
        accessToken = null;
        setTokenState('');
        showSuccess('signOut', 'Signed out.');
    } catch (ex) {
        showError('signOut', ex);
    }
}

async function cancelAuthorization() {
    try {
        await HMSAccount.cancelAuthorization();
        showSuccess('cancelAuthorization', 'Authorization cancelled.');
    } catch (ex) {
        showError('cancelAuthorization', ex);
    }
}

async function silentSignIn() {
    try {
        var authParam = HMSCommonTypes.AuthParams.DEFAULT_AUTH_REQUEST_PARAM;
        var packageName = HMSCommonTypes.PackageName.HWID;
        var res = await HMSAccount.silentSignIn(authParam, packageName);
        accessToken = res.accessToken || accessToken;
        setTokenState(accessToken);
        showSuccess('silentSignIn', res);
    } catch (ex) {
        showError('silentSignIn', ex);
    }
}

function getHuaweiIdAuthButton() {
    var edittedButton = 'btn_auth_button';

    HMSHuaweiIdAuthButton.getHuaweiIdAuthButton(
        edittedButton,
        HMSHuaweiIdAuthButton.Theme.THEME_FULL_TITLE,
        HMSHuaweiIdAuthButton.ColorPolicy.COLOR_POLICY_RED,
        HMSHuaweiIdAuthButton.CornerRadius.CORNER_RADIUS_LARGE
    );
    setStatus('success', 'HuaweiIdAuthButton ready', 'Native Huawei sign-in button rendered below the HMSAccount card.');
    alert('getHuaweiIdAuthButton -> success');
}

async function containScopes() {
    var authAccount = {
        openId: 'myOpenId',
        uid: 'myUid',
        photoUriString: 'myPhotoUrl',
        displayName: 'myDisplayName',
        accessToken: 'myAccessToken',
        serviceCountryCode: 'myServiceCountryCode',
        gender: 0,
        status: 2,
        carrierId: 0,
        unionId: 'myUnionId',
        serverAuthCode: 'myServerAuthCode',
        countryCode: 'myCountryCode',
        grantedScopes: [
            HMSCommonTypes.AuthScopeList.OPENID,
            HMSCommonTypes.AuthScopeList.PROFILE,
            HMSCommonTypes.AuthScopeList.EMAIL
        ]
    };

    var authScopeList = [HMSCommonTypes.AuthScopeList.OPENID, HMSCommonTypes.AuthScopeList.PROFILE];
    var packageName = HMSCommonTypes.PackageName.ACCOUNT;

    try {
        var res = await HMSAccountAuthManager.containScopes(authAccount, authScopeList, packageName);
        showSuccess('containScopes', res);
    } catch (ex) {
        showError('containScopes', ex);
    }
}

async function getAuthResult() {
    try {
        var packageName = HMSCommonTypes.PackageName.ACCOUNT;
        var res = await HMSAccountAuthManager.getAuthResult(packageName);
        showSuccess('getAuthResult', res);
    } catch (ex) {
        showError('getAuthResult', ex);
    }
}

async function getAuthResultWithScopes() {
    var authScopeList = [HMSCommonTypes.AuthScopeList.OPENID, HMSCommonTypes.AuthScopeList.PROFILE];
    var packageName = HMSCommonTypes.PackageName.ACCOUNT;

    try {
        var res = await HMSAccountAuthManager.getAuthResultWithScope(authScopeList, packageName);
        showSuccess('getAuthResultWithScope', res);
    } catch (ex) {
        showError('getAuthResultWithScope', ex);
    }
}

async function addAuthScopes() {
    var authScopeList = [HMSCommonTypes.AuthScopeList.EMAIL];
    var packageName = HMSCommonTypes.PackageName.ACCOUNT;

    try {
        await HMSAccountAuthManager.addAuthScopes(8888, authScopeList, packageName);
        showSuccess('addAuthScopes', 'Additional scopes requested.');
    } catch (ex) {
        showError('addAuthScopes', ex);
    }
}

async function hwidContainScopes() {
    var authAccount = {
        openId: 'myOpenId',
        uid: 'myUid',
        photoUriString: 'myPhotoUrl',
        displayName: 'myDisplayName',
        accessToken: 'myAccessToken',
        serviceCountryCode: 'myServiceCountryCode',
        gender: 0,
        status: 2,
        carrierId: 0,
        unionId: 'myUnionId',
        serverAuthCode: 'myServerAuthCode',
        countryCode: 'myCountryCode',
        grantedScopes: [
            HMSCommonTypes.AuthScopeList.OPENID,
            HMSCommonTypes.AuthScopeList.PROFILE,
            HMSCommonTypes.AuthScopeList.EMAIL
        ]
    };

    var authScopeList = [HMSCommonTypes.AuthScopeList.OPENID, HMSCommonTypes.AuthScopeList.PROFILE];
    var packageName = HMSCommonTypes.PackageName.HWID;

    try {
        var res = await HMSHuaweiIdAuthManager.containScopes(authAccount, authScopeList, packageName);
        showSuccess('hwidContainScopes', res);
    } catch (ex) {
        showError('hwidContainScopes', ex);
    }
}

async function hwidGetAuthResult() {
    try {
        var packageName = HMSCommonTypes.PackageName.HWID;
        var res = await HMSHuaweiIdAuthManager.getAuthResult(packageName);
        showSuccess('hwidGetAuthResult', res);
    } catch (ex) {
        showError('hwidGetAuthResult', ex);
    }
}

async function hwidGetAuthResultWithScopes() {
    var authScopeList = [HMSCommonTypes.AuthScopeList.OPENID, HMSCommonTypes.AuthScopeList.PROFILE];
    var packageName = HMSCommonTypes.PackageName.HWID;

    try {
        var res = await HMSHuaweiIdAuthManager.getAuthResultWithScope(authScopeList, packageName);
        showSuccess('hwidGetAuthResultWithScope', res);
    } catch (ex) {
        showError('hwidGetAuthResultWithScope', ex);
    }
}

async function hwidAddAuthScopes() {
    var authScopeList = [HMSCommonTypes.AuthScopeList.EMAIL];
    var packageName = HMSCommonTypes.PackageName.HWID;

    try {
        await HMSHuaweiIdAuthManager.addAuthScopes(8888, authScopeList, packageName);
        showSuccess('hwidAddAuthScopes', 'Additional scopes requested.');
    } catch (ex) {
        showError('hwidAddAuthScopes', ex);
    }
}

async function deleteAuthInfo() {
    try {
        var res = await HMSHuaweiIdAuthTool.deleteAuthInfo('accessTokenData');
        showSuccess('deleteAuthInfo', res);
    } catch (ex) {
        showError('deleteAuthInfo', ex);
    }
}

async function requestUnionId() {
    try {
        var res = await HMSHuaweiIdAuthTool.requestUnionId('test@test.com');
        showSuccess('requestUnionId', res);
    } catch (ex) {
        showError('requestUnionId', ex);
    }
}

async function requestAccessToken() {
    var account = {
        type: 'com.huawei.hwid',
        name: 'test@test.com'
    };

    var scopeList = [HMSCommonTypes.AuthScopeList.EMAIL];

    try {
        var res = await HMSHuaweiIdAuthTool.requestAccessToken(account, scopeList);
        showSuccess('requestAccessToken', res);
    } catch (ex) {
        showError('requestAccessToken', ex);
    }
}

async function buildNetworkUrl() {
    var domainInfo = {
        domain: 'www.demo.com',
        isUseHttps: true
    };

    try {
        var res = await HMSNetworkTool.buildNetworkURL(domainInfo);
        console.log(JSON.stringify(res));
        showSuccess('buildNetworkURL', res);
    } catch (ex) {
        showError('buildNetworkURL', ex);
    }
}

async function buildNetworkCookie() {
    var cookieInfo = {
        cookieName: 'hello',
        cookieValue: 'world',
        domain: 'www.demo.com',
        path: '/demo',
        isHttpOnly: true,
        isSecure: true,
        maxAge: 10
    };

    try {
        var res = await HMSNetworkTool.buildNetworkCookie(cookieInfo);
        console.log(JSON.stringify(res));
        showSuccess('buildNetworkCookie', res);
    } catch (ex) {
        showError('buildNetworkCookie', ex);
    }
}

async function obtainHashCode() {
    try {
        var res = await HMSReadSMSManager.obtainHashCode();
        showSuccess('obtainHashCode', res);
    } catch (ex) {
        showError('obtainHashCode', ex);
    }
}

async function startConsent() {
    try {
        var res = await HMSReadSMSManager.startConsent('+90...');
        showSuccess('startConsent', res);
    } catch (ex) {
        showError('startConsent', ex);
    }
}

async function smsVerificationCode() {
    try {
        var res = await HMSReadSMSManager.smsVerificationCode();
        showSuccess('smsVerificationCode', res);
    } catch (ex) {
        showError('smsVerificationCode', ex);
    }
}

app.initialize();
