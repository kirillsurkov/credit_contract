## Методы

#### approve(uint256 id, uint256 amount)
Одобрить кредит на сумму `amount`, не превышающую сумму в заявке. Может вызвать только владелец.
<br/>
#### refuse(uint256 id)
Отказать в кредите. Может вызвать только владелец.
<br/>
#### user_request(uint256 amount)
Запросить amount у контракта.
<br/>
#### user_take(uint256 id)
Принять одобренный кредит по `order_id`
<br/>
#### user_deny(uint256 id)
Отказаться от одобренного кредита.
<br/>
#### user_request_delegated(bytes memory data, uint8 v, bytes32 r, bytes32 s)
Оформить кредит через другого пользователя. `data` - данные, `v`, `r`, `s` - подпись этих данных.  
Структура `data`:  
`contract address` + `signer address` + `amount uint256`
<br/>
#### user_take_delegated(bytes memory data, uint8 v, bytes32 r, bytes32 s)
Принять одобренный кредит через другого пользователя.  
Структура `data`:  
`contract address` + `signer address` + `order_id uint256`
<br/>
#### user_deny_delegated(bytes memory data, uint8 v, bytes32 r, bytes32 s)
Отказаться от одобренного кредита через другого пользователя.  
Структура `data`:  
`contract address` + `signer address` + `order_id uint256`

## Тесты
```bash
truffle compile
truffle test
```

```
$ truffle compile
Compiling your contracts...
===========================
> Compiling ./contracts/Credit.sol
> Compiling ./contracts/Migrations.sol
> Artifacts written to /home/kirill/work/crypto/eth/credit_contract/build/contracts
> Compiled successfully using:
   - solc: 0.5.12+commit.7709ece9.Emscripten.clang

```

```
$ truffle test
Using network 'test'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



  Contract: Credit
    ✓ test request-approve-take (162ms)
    ✓ test request-approve-deny (113ms)
    ✓ test request-refuse (76ms)
    ✓ test delegated request-approve-take (153ms)
    ✓ test delegated request-approve-deny (133ms)

 32 pragma solidity ^0.5.12;

  5 passing (658ms)
```
