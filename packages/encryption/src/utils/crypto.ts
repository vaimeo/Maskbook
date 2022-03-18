import { AESCryptoKey, CheckedError, EC_CryptoKey } from '@masknet/shared-base'
import { Result, Ok } from 'ts-results'
import { EC_KeyCurveEnum } from '../payload'
import { CryptoException } from '../types'
export function importAES(key: JsonWebKey | Uint8Array): Promise<Result<AESCryptoKey, unknown>> {
    return Result.wrapAsync(() => {
        if (key instanceof Uint8Array) {
            return crypto.subtle.importKey('raw', key, { name: 'AES-GCM', length: 256 }, true, [
                'encrypt',
                'decrypt',
            ]) as any
        }
        return crypto.subtle.importKey('jwk', key, { name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
            'decrypt',
        ]) as any
    })
}

export function exportCryptoKeyToJWK(key: CryptoKey) {
    return Result.wrapAsync(() => crypto.subtle.exportKey('jwk', key))
}
export function exportCryptoKeyToSPKI(key: CryptoKey) {
    return Result.wrapAsync(() => crypto.subtle.exportKey('spki', key).then((x) => new Uint8Array(x)))
}
export function exportCryptoKeyToRaw(key: CryptoKey) {
    return Result.wrapAsync(() => crypto.subtle.exportKey('raw', key).then((x) => new Uint8Array(x)))
}

export function importEC_Key(key: JsonWebKey | Uint8Array, kind: EC_KeyCurveEnum) {
    const DeriveKeyUsage: KeyUsage[] = ['deriveKey', 'deriveBits']
    const ImportParamsMap = {
        [EC_KeyCurveEnum.secp256k1]: { name: 'ECDH', namedCurve: 'K-256' } as EcKeyImportParams,
        [EC_KeyCurveEnum.secp256p1]: { name: 'ECDH', namedCurve: 'P-256' } as EcKeyImportParams,
    } as const
    return Result.wrapAsync(async () => {
        if (kind === EC_KeyCurveEnum.ed25519) {
            throw new CheckedError(CryptoException.UnsupportedAlgorithm, 'TODO: support ED25519')
        }
        const args = [ImportParamsMap[kind], true, DeriveKeyUsage] as const
        if (key instanceof Uint8Array) {
            return crypto.subtle.importKey('spki', key, ...args) as Promise<EC_CryptoKey>
        } else {
            return crypto.subtle.importKey('jwk', key, ...args) as Promise<EC_CryptoKey>
        }
    })
}

export function encryptWithAES(key: CryptoKey, iv: Uint8Array, message: Uint8Array) {
    return Result.wrapAsync(async () => {
        const x = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, message)
        return new Uint8Array(x)
    })
}
export function decryptWithAES(key: CryptoKey, iv: Uint8Array, message: Uint8Array) {
    return Result.wrapAsync(async () => {
        return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, message))
    })
}
export function assertIVLengthEq16(arrayBuffer: Uint8Array) {
    if (arrayBuffer.byteLength === 16) return Ok(arrayBuffer)
    return new CheckedError(CryptoException.InvalidIVLength, null).toErr()
}
