use anchor_lang::error_code;

#[error_code]
pub enum BountyBoardError {
    BountyAlreadyAssigned,
    RejectionTooEarly,
    // and others...
}
